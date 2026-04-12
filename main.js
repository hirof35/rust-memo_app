// window.__TAURI__ から必要な機能を読み込む
const { invoke } = window.__TAURI__.core;
const { save } = window.__TAURI__.dialog;

const memoInput = document.querySelector("#memo-input");
const saveBtn = document.querySelector("#save-btn");
const statusMsg = document.querySelector("#status");
const charCountDisplay = document.querySelector("#char-count");

// 保存処理：ダイアログを出して、選択されたパスをRustに投げる
async function handleSaveAs() {
  try {
    // 1. 保存先を選択するダイアログを表示（Windows標準のウィンドウが出る）
    const path = await save({
      filters: [{
        name: 'テキストファイル',
        extensions: ['txt']
      }],
      defaultPath: 'memo.txt'
    });

    // ユーザーがキャンセルした場合は何もしない
    if (!path) {
      statusMsg.textContent = "保存はキャンセルされました。";
      return;
    }

    statusMsg.textContent = "保存中...";

    // 2. Rust側の save_memo(path, content) を呼び出す
    // ここで 'path' というキーで値を渡すのが、エラー解決の鍵です！
    const response = await invoke("save_memo", { 
      path: path, 
      content: memoInput.value 
    });

    statusMsg.textContent = `${response}: ${path}`;
  } catch (err) {
    statusMsg.textContent = "エラー: " + err;
    console.error(err);
  }
}

// ボタンクリック
saveBtn.addEventListener("click", handleSaveAs);

// 文字数カウント & 未保存ステータス
memoInput.addEventListener("input", () => {
  const count = memoInput.value.length;
  charCountDisplay.textContent = `文字数: ${count}`;

  if (!statusMsg.textContent.includes("*") && !statusMsg.textContent.includes("保存中")) {
    statusMsg.textContent = "編集を保存していません (*)";
  }
});

// ショートカットキー (Ctrl + S)
window.addEventListener("keydown", async (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === "s") {
    event.preventDefault();
    await handleSaveAs();
  }
});

// 起動時の処理（読み込み）
window.addEventListener("DOMContentLoaded", async () => {
  try {
    const savedContent = await invoke("load_memo");
    memoInput.value = savedContent;
    charCountDisplay.textContent = `文字数: ${savedContent.length}`;
    if (savedContent) {
      statusMsg.textContent = "前回のデフォルトメモを読み込みました。";
    }
  } catch (err) {
    console.error("初期読み込みエラー:", err);
  }
});
