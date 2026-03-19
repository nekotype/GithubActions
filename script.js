export function getWorkflowChecklist() {
  return [
    {
      id: "test",
      title: "自動テスト",
      description: "push と pull request で node --test を実行します。"
    },
    {
      id: "review",
      title: "AI PRレビュー",
      description: "PR差分をOpenAIへ送り、重大な指摘があればチェックを失敗させます。"
    },
    {
      id: "deploy",
      title: "GitHub Pagesデプロイ",
      description: "main へマージされたら静的サイトを自動公開します。"
    }
  ];
}

export function renderWorkflowItems(items) {
  return items
    .map((item, index) => {
      return `
        <li class="workflow-item">
          <span class="badge">${index + 1}</span>
          <div class="workflow-copy">
            <strong>${item.title}</strong>
            <span>${item.description}</span>
          </div>
        </li>
      `.trim();
    })
    .join("");
}

export function initializePage(doc = globalThis.document) {
  if (!doc) {
    return;
  }

  const list = doc.querySelector("#workflow-list");
  if (!list) {
    return;
  }

  list.innerHTML = renderWorkflowItems(getWorkflowChecklist());
}

if (typeof document !== "undefined") {
  initializePage();
}

