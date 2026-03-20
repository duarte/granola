import { homedir } from "os";
import { join } from "path";
import { prosemirrorToMarkdown } from "./prosemirror";

// --- Types ---

export interface Attendee {
  name: string;
  email: string;
}

export interface CalendarEvent {
  id: string;
  summary: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  attendees?: { email: string; displayName?: string; responseStatus?: string }[];
}

export interface Meeting {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  attendees: Attendee[];
  notes_markdown: string;
  notes_plain: string;
  calendar_event: CalendarEvent | null;
  transcript: TranscriptUtterance[] | null;
}

export interface TranscriptUtterance {
  text: string;
  source: string;
  start_time?: number;
  end_time?: number;
  start_timestamp?: string;
  end_timestamp?: string;
}

// --- Raw cache types ---

interface RawPerson {
  name?: string;
  email: string;
  details?: {
    person?: {
      name?: { fullName?: string; givenName?: string; familyName?: string };
    };
  };
}

interface RawDocument {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  notes_markdown: string | null;
  notes_plain: string | null;
  notes: unknown;
  people: {
    attendees?: RawPerson[];
    creator?: RawPerson;
  } | null;
  google_calendar_event: CalendarEvent | null;
  type: string;
  valid_meeting: boolean | null;
}

interface RawTranscript {
  utterances?: TranscriptUtterance[];
}

interface CacheState {
  documents: Record<string, RawDocument>;
  transcripts: Record<string, RawTranscript | TranscriptUtterance[]>;
}

// --- Cache reading ---

const CACHE_DIR = join(homedir(), "Library/Application Support/Granola");

let cachedState: CacheState | null = null;

function findCacheFile(): string | null {
  // Find all cache-vN.json files and pick the highest version
  const { readdirSync } = require("fs");
  try {
    const files: string[] = readdirSync(CACHE_DIR);
    const versions = files
      .map((f: string) => f.match(/^cache-v(\d+)\.json$/))
      .filter(Boolean)
      .map((m: RegExpMatchArray) => parseInt(m[1], 10))
      .sort((a: number, b: number) => b - a);

    for (const v of versions) {
      const p = join(CACHE_DIR, `cache-v${v}.json`);
      if (Bun.file(p).size > 0) return p;
    }
  } catch {}
  return null;
}

export function readCache(): CacheState {
  if (cachedState) return cachedState;

  const cachePath = findCacheFile();
  if (!cachePath) {
    throw new Error(
      "Granola cache not found. Is Granola installed?"
    );
  }

  const raw = JSON.parse(
    require("fs").readFileSync(cachePath, "utf-8")
  );

  let state: CacheState;

  if (typeof raw.cache === "string") {
    // v3: double-encoded
    state = JSON.parse(raw.cache).state;
  } else if (raw.cache?.state) {
    // v4: direct object
    state = raw.cache.state;
  } else {
    throw new Error("Unexpected cache format");
  }

  cachedState = state;
  return state;
}

function parseAttendee(raw: RawPerson, calendarNames?: Map<string, string>): Attendee {
  const name =
    raw.name ||
    raw.details?.person?.name?.fullName ||
    calendarNames?.get(raw.email) ||
    raw.email.split("@")[0];
  return { name, email: raw.email };
}

export function getMeetings(): Meeting[] {
  const state = readCache();
  const meetings: Meeting[] = [];

  for (const doc of Object.values(state.documents)) {
    if (doc.deleted_at) continue;

    // Build calendar attendee name lookup
    const calendarNames = new Map<string, string>();
    if (doc.google_calendar_event?.attendees) {
      for (const a of doc.google_calendar_event.attendees) {
        if (a.email && a.displayName) {
          calendarNames.set(a.email, a.displayName);
        }
      }
    }

    const attendees: Attendee[] = [];
    if (doc.people?.attendees) {
      for (const a of doc.people.attendees) {
        attendees.push(parseAttendee(a, calendarNames));
      }
    }

    const rawTranscript = state.transcripts[doc.id];
    const transcript = Array.isArray(rawTranscript)
      ? rawTranscript
      : rawTranscript?.utterances || null;

    // Fall back to ProseMirror conversion when notes_markdown is empty
    let notesMarkdown = doc.notes_markdown || "";
    if (!notesMarkdown && doc.notes) {
      notesMarkdown = prosemirrorToMarkdown(doc.notes);
    }

    meetings.push({
      id: doc.id,
      title: doc.title || "(untitled)",
      created_at: doc.created_at,
      updated_at: doc.updated_at,
      attendees,
      notes_markdown: notesMarkdown,
      notes_plain: doc.notes_plain || "",
      calendar_event: doc.google_calendar_event || null,
      transcript,
    });
  }

  // Sort newest first
  meetings.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return meetings;
}

export function getMeeting(id: string): Meeting | null {
  const meetings = getMeetings();
  return meetings.find((m) => m.id === id) || null;
}
