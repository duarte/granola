interface PMNode {
  type: string;
  content?: PMNode[];
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: PMMark[];
}

interface PMMark {
  type: string;
  attrs?: Record<string, unknown>;
}

export function prosemirrorToMarkdown(doc: unknown): string {
  if (!doc || typeof doc !== "object") return "";
  const node = doc as PMNode;
  if (node.type !== "doc" || !node.content) return "";
  return renderNodes(node.content, 0).trim();
}

function renderNodes(nodes: PMNode[], depth: number): string {
  let result = "";
  let listIndex = 1;

  for (const node of nodes) {
    switch (node.type) {
      case "heading": {
        const level = (node.attrs?.level as number) || 1;
        const prefix = "#".repeat(level);
        result += `${prefix} ${renderInline(node.content)}\n\n`;
        break;
      }
      case "paragraph": {
        const text = renderInline(node.content);
        result += `${text}\n\n`;
        break;
      }
      case "bulletList": {
        result += renderList(node.content, depth, "bullet");
        if (depth === 0) result += "\n";
        break;
      }
      case "orderedList": {
        listIndex = 1;
        result += renderList(node.content, depth, "ordered");
        if (depth === 0) result += "\n";
        break;
      }
      case "taskList": {
        result += renderList(node.content, depth, "task");
        if (depth === 0) result += "\n";
        break;
      }
      case "listItem":
      case "taskItem": {
        // Handled by renderList
        break;
      }
      case "blockquote": {
        const inner = renderNodes(node.content || [], depth).trim();
        result += inner
          .split("\n")
          .map((l) => `> ${l}`)
          .join("\n");
        result += "\n\n";
        break;
      }
      case "codeBlock": {
        const lang = (node.attrs?.language as string) || "";
        result += `\`\`\`${lang}\n${renderInline(node.content)}\n\`\`\`\n\n`;
        break;
      }
      case "hardBreak": {
        result += "\n";
        break;
      }
      case "horizontalRule": {
        result += "---\n\n";
        break;
      }
      default: {
        if (node.content) {
          result += renderNodes(node.content, depth);
        }
        break;
      }
    }
  }

  return result;
}

function renderList(
  items: PMNode[] | undefined,
  depth: number,
  type: "bullet" | "ordered" | "task"
): string {
  if (!items) return "";
  let result = "";
  let index = 1;

  for (const item of items) {
    if (item.type !== "listItem" && item.type !== "taskItem") continue;
    const indent = "  ".repeat(depth);
    let marker: string;
    if (type === "task") {
      const checked = item.attrs?.checked ? "x" : " ";
      marker = `- [${checked}]`;
    } else {
      marker = type === "bullet" ? "-" : `${index}.`;
    }

    const children = item.content || [];
    let firstLine = true;

    for (const child of children) {
      if (child.type === "paragraph") {
        const text = renderInline(child.content);
        if (firstLine) {
          result += `${indent}${marker} ${text}\n`;
          firstLine = false;
        } else {
          result += `${indent}  ${text}\n`;
        }
      } else if (
        child.type === "bulletList" ||
        child.type === "orderedList" ||
        child.type === "taskList"
      ) {
        const subType =
          child.type === "bulletList" ? "bullet" :
          child.type === "orderedList" ? "ordered" : "task";
        result += renderList(child.content, depth + 1, subType);
      } else if (child.content) {
        result += renderNodes([child], depth + 1);
      }
    }
    index++;
  }

  return result;
}

function renderInline(content: PMNode[] | undefined): string {
  if (!content) return "";
  let result = "";

  for (const node of content) {
    if (node.type === "text") {
      let text = node.text || "";
      if (node.marks) {
        for (const mark of node.marks) {
          switch (mark.type) {
            case "bold":
            case "strong":
              text = `**${text}**`;
              break;
            case "italic":
            case "em":
              text = `*${text}*`;
              break;
            case "code":
              text = `\`${text}\``;
              break;
            case "link": {
              const href = mark.attrs?.href as string;
              if (href) text = `[${text}](${href})`;
              break;
            }
            case "strike":
            case "strikethrough":
              text = `~~${text}~~`;
              break;
          }
        }
      }
      result += text;
    } else if (node.type === "hardBreak") {
      result += "\n";
    } else if (node.content) {
      result += renderInline(node.content);
    }
  }

  return result;
}
