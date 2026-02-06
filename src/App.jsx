import { useState, useMemo } from "react";
import "./App.css";
import data from "./data.json";

function App() {
  // eslint-disable-next-line no-unused-vars
  const [items] = useState(data);
  const [visibleCount, setVisibleCount] = useState(50);

  // Filter & Sort State
  const [filterWinner, setFilterWinner] = useState("ALL");
  const [sortType, setSortType] = useState("SAVINGS_DESC");
  const [isSortOpen, setIsSortOpen] = useState(false);

  // Stats
  const rdCount = items.filter((i) => i.winner === "RD").length;
  const brCount = items.filter((i) => i.winner === "BR").length;
  const debCount = items.filter((i) => i.winner === "DEB").length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 50);
  };

  const formatPriceDiff = (item) => {
    // Collect available prices
    const prices = [];
    if (item.rd?.price) prices.push(item.rd.price);
    if (item.br?.price) prices.push(item.br.price);
    if (item.deb?.price) prices.push(item.deb.price);

    if (prices.length < 2) return null;

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const diff = maxPrice - minPrice;

    return `£${diff.toFixed(2)}`;
  };

  const calculatePercentage = (item) => {
    const prices = [];
    if (item.rd?.price) prices.push(item.rd.price);
    if (item.br?.price) prices.push(item.br.price);
    if (item.deb?.price) prices.push(item.deb.price);

    if (prices.length < 2) return 0;

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const diff = maxPrice - minPrice;

    return (diff / maxPrice) * 100;
  };

  // Filter & Sort Logic
  const processedItems = useMemo(() => {
    let result = [...items];

    if (filterWinner !== "ALL") {
      result = result.filter((item) => item.winner === filterWinner);
    }

    result.sort((a, b) => {
      if (sortType === "SAVINGS_DESC") {
        return calculatePercentage(b) - calculatePercentage(a);
      } else if (sortType === "SAVINGS_ASC") {
        return calculatePercentage(a) - calculatePercentage(b);
      }
      return 0;
    });

    return result;
  }, [items, filterWinner, sortType]);

  const sortOptions = [
    { value: "DEFAULT", label: "Default Order" },
    { value: "SAVINGS_DESC", label: "Best Savings First (%)" },
    { value: "SAVINGS_ASC", label: "Lowest Savings First (%)" },
  ];

  const currentSortLabel = sortOptions.find((o) => o.value === sortType)?.label;

  return (
    <div className="app-container">
      <header className="main-header">
        <div className="header-content">
          <h1>Rug Comparison</h1>
          <p className="subtitle">
            Premium Deal Scout: Analyzing <strong>{items.length}</strong>{" "}
            Products
          </p>

          <div className="stats-bar">
            <div className="stat-item">
              <span className="label">Rugs Direct</span>
              <span className="value rd-color">{rdCount}</span>
            </div>
            <div className="stat-item">
              <span className="label">Boutique Rugs</span>
              <span className="value br-color">{brCount}</span>
            </div>
            <div className="stat-item">
              <span className="label">Debenhams</span>
              <span className="value deb-color">{debCount}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Controls Section */}
      <div className="controls-section">
        <div className="control-group">
          <label>Show Winner</label>
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filterWinner === "ALL" ? "active" : ""}`}
              onClick={() => setFilterWinner("ALL")}
            >
              All Matches
            </button>
            <button
              className={`filter-btn ${filterWinner === "RD" ? "active" : ""}`}
              onClick={() => setFilterWinner("RD")}
              data-type="RD"
            >
              Rugs Direct
            </button>
            <button
              className={`filter-btn ${filterWinner === "BR" ? "active" : ""}`}
              onClick={() => setFilterWinner("BR")}
              data-type="BR"
            >
              Boutique Rugs
            </button>
            <button
              className={`filter-btn ${filterWinner === "DEB" ? "active" : ""}`}
              onClick={() => setFilterWinner("DEB")}
              data-type="DEB"
            >
              Debenhams
            </button>
          </div>
        </div>

        <div className="control-group">
          <label>Sort By</label>
          <div className="custom-select-wrapper">
            <div
              className={`custom-select-trigger ${isSortOpen ? "open" : ""}`}
              onClick={() => setIsSortOpen(!isSortOpen)}
            >
              <span>{currentSortLabel}</span>
              <div className="arrow"></div>
            </div>
            {isSortOpen && (
              <div className="custom-options">
                {sortOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`custom-option ${sortType === option.value ? "selected" : ""}`}
                    onClick={() => {
                      setSortType(option.value);
                      setIsSortOpen(false);
                    }}
                  >
                    {option.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="grid-container">
        {processedItems.slice(0, visibleCount).map((item) => {
          const savings = formatPriceDiff(item);
          const percent = calculatePercentage(item).toFixed(0);

          let badgeClass = "rd-bg";
          if (item.winner === "BR") badgeClass = "br-bg";
          if (item.winner === "DEB") badgeClass = "deb-bg";

          return (
            <div key={item.id} className="product-card">
              <div className="card-header">
                <div className="header-left">
                  <h2 className="product-title">{item.name}</h2>
                  <div className="tags">
                    <span className="tag dimension">{item.dimension}</span>
                  </div>
                </div>
                {savings && (
                  <div className="header-right">
                    <span className={`tag savings ${badgeClass}`}>
                      Save {savings} ({percent}%)
                    </span>
                  </div>
                )}
              </div>

              <div className="comparison-body">
                {/* Rugs Direct */}
                <div
                  className={`vendor-col ${item.winner === "RD" ? "winner" : ""}`}
                >
                  <div className="vendor-header">
                    <span className="vendor-name rd-text">Rugs Direct</span>
                    {item.winner === "RD" && (
                      <span className="winner-icon">🏆</span>
                    )}
                  </div>
                  <div className="image-wrapper">
                    {item.rd?.image ? (
                      <img src={item.rd.image} alt="RD" loading="lazy" />
                    ) : (
                      <span className="no-data">N/A</span>
                    )}
                  </div>
                  <div className="price-section">
                    <div className="current-price">
                      {item.rd?.formattedPrice || "-"}
                    </div>
                    {item.rd?.url && (
                      <a
                        href={item.rd.url}
                        target="_blank"
                        rel="noreferrer"
                        className="shop-btn rd-btn"
                      >
                        View Deal
                      </a>
                    )}
                  </div>
                </div>

                <div className="col-divider">
                  <span>VS</span>
                </div>

                {/* Boutique Rugs */}
                <div
                  className={`vendor-col ${item.winner === "BR" ? "winner" : ""}`}
                >
                  <div className="vendor-header">
                    <span className="vendor-name br-text">Boutique Rugs</span>
                    {item.winner === "BR" && (
                      <span className="winner-icon">🏆</span>
                    )}
                  </div>
                  <div className="image-wrapper">
                    {item.br?.image ? (
                      <img src={item.br.image} alt="BR" loading="lazy" />
                    ) : (
                      <span className="no-data">N/A</span>
                    )}
                  </div>
                  <div className="price-section">
                    <div className="current-price">
                      {item.br?.formattedPrice || "-"}
                    </div>
                    {item.br?.url && (
                      <a
                        href={item.br.url}
                        target="_blank"
                        rel="noreferrer"
                        className="shop-btn br-btn"
                      >
                        View Deal
                      </a>
                    )}
                  </div>
                </div>

                <div className="col-divider">
                  <span>VS</span>
                </div>

                {/* Debenhams */}
                <div
                  className={`vendor-col ${item.winner === "DEB" ? "winner" : ""}`}
                >
                  <div className="vendor-header">
                    <span className="vendor-name deb-text">Debenhams</span>
                    {item.winner === "DEB" && (
                      <span className="winner-icon">🏆</span>
                    )}
                  </div>
                  <div className="image-wrapper">
                    {item.deb?.image ? (
                      <img src={item.deb.image} alt="DEB" loading="lazy" />
                    ) : (
                      <span
                        className="no-data"
                        style={{ color: "#cbd5e1", fontWeight: "bold" }}
                      >
                        N/A
                      </span>
                    )}
                  </div>
                  <div className="price-section">
                    <div className="current-price">
                      {item.deb?.formattedPrice || "-"}
                    </div>
                    {item.deb?.url && (
                      <a
                        href={item.deb.url}
                        target="_blank"
                        rel="noreferrer"
                        className="shop-btn deb-btn"
                      >
                        View Deal
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </main>

      {processedItems.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
          No products found matching filters.
        </div>
      )}

      {visibleCount < items.length && (
        <div className="pagination-action">
          <button onClick={handleLoadMore} className="load-more-btn">
            Load More Products ({items.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
