import { useCallback, useEffect, useState } from "react";

function formatDate(dateString) {
  if (!dateString) return "-";

  return new Date(dateString).toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function App() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // API からデータ一覧を取得
  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/items");

      if (!response.ok) {
        throw new Error("データの取得に失敗しました");
      }

      const data = await response.json();
      setItems(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "サーバーに接続できませんでした",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // データを登録
  async function handleSubmit(event) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("データ名を入力してください");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "データの登録に失敗しました");
      }

      setName("");
      setMessage("データを登録しました");
      await fetchItems();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "データの登録に失敗しました",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <a className="brand" href="/" aria-label="ホーム">
            <span className="brand-icon">M</span>
            <span>MongoDB Manager</span>
          </a>

          <span className="status">
            <span className="status-dot" />
            API クライアント
          </span>
        </div>
      </header>

      <main className="main">
        <section className="hero">
          <p className="eyebrow">FULL STACK DEVELOPMENT</p>
          <h1>データ管理</h1>
          <p className="hero-description">
            React・Express・Mongoose で作るシンプルなデータ管理アプリ。
            データを登録して MongoDB に保存できます。
          </p>
        </section>

        <section className="stats">
          <div className="stat-card">
            <span className="stat-label">登録データ数</span>
            <strong className="stat-number">
              {loading ? "—" : items.length}
            </strong>
            <span className="stat-caption">件のデータ</span>
          </div>

          <div className="stat-card">
            <span className="stat-label">データベース</span>
            <strong className="stat-database">MongoDB</strong>
            <span className="stat-caption">Mongoose 経由で接続</span>
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>新しいデータを登録</h2>
              <p>データ名を入力してください。</p>
            </div>
          </div>

          <form className="entry-form" onSubmit={handleSubmit}>
            <label htmlFor="item-name">データ名</label>

            <div className="form-row">
              <input
                id="item-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="例：最初のデータ"
                maxLength={100}
                disabled={saving}
              />

              <button
                type="submit"
                className="primary-button"
                disabled={saving || !name.trim()}
              >
                {saving ? "登録中..." : "登録する"}
              </button>
            </div>
          </form>

          {error && (
            <div className="notice error" role="alert">
              {error}
            </div>
          )}

          {message && (
            <div className="notice success" role="status">
              {message}
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panel-heading list-heading">
            <div>
              <h2>登録済みデータ</h2>
              <p>MongoDB から取得したデータを表示しています。</p>
            </div>

            <button
              type="button"
              className="secondary-button"
              onClick={fetchItems}
              disabled={loading}
            >
              {loading ? "読込中..." : "再読み込み"}
            </button>
          </div>

          {loading ? (
            <div className="empty-state">データを読み込んでいます...</div>
          ) : items.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">＋</span>
              <strong>データはまだありません</strong>
              <p>最初のデータを登録してみましょう。</p>
            </div>
          ) : (
            <div className="item-list">
              {items.map((item) => (
                <article className="item" key={item._id}>
                  <div className="item-icon">D</div>

                  <div className="item-content">
                    <strong>{item.name}</strong>
                    <span>{formatDate(item.createdAt)}</span>
                  </div>

                  <span className="item-badge">保存済み</span>
                </article>
              ))}
            </div>
          )}
        </section>

        <footer className="footer">
          <span>Vite + React</span>
          <span>Express + Mongoose + MongoDB</span>
        </footer>
      </main>
    </div>
  );
}
