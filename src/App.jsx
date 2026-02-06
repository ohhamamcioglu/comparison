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

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 50);
  };

  const formatPriceDiff = (item) => {
    if (!item.rd.price || !item.br.price) return null;
    const diff = Math.abs(item.rd.price - item.br.price);
    return `£${diff.toFixed(2)}`;
  };

  const calculatePercentage = (item) => {
    if (!item.rd.price || !item.br.price) return 0;
    const diff = Math.abs(item.rd.price - item.br.price);
    const maxPrice = Math.max(item.rd.price, item.br.price);
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
                    <span
                      className={`tag savings ${item.winner === "RD" ? "rd-bg" : "br-bg"}`}
                    >
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
                    <img
                      src={item.rd.image}
                      alt="Rugs Direct Variant"
                      loading="lazy"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.parentElement.classList.add("no-image");
                      }}
                    />
                  </div>
                  <div className="price-section">
                    <div className="current-price">
                      {item.rd.formattedPrice}
                    </div>
                    <a
                      href={item.rd.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shop-btn rd-btn"
                    >
                      View Deal
                    </a>
                  </div>
                </div>

                {/* Divider for Mobile/Desktop */}
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
                    <img
                      src={item.br.image}
                      alt="Boutique Rugs Variant"
                      loading="lazy"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.parentElement.classList.add("no-image");
                      }}
                    />
                  </div>
                  <div className="price-section">
                    <div className="current-price">
                      {item.br.formattedPrice}
                    </div>
                    <a
                      href={item.br.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shop-btn br-btn"
                    >
                      View Deal
                    </a>
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
