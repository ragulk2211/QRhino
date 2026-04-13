import { useEffect, useRef, useCallback } from "react";
import "../styles/CategoryTabs.css";

function CategoryTabs({ categories = [], active, setActive }) {
  const tabsRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

  // Scroll to section when clicking tab
  const scrollToSection = useCallback((categoryId) => {
    const section = document.getElementById(categoryId);
    if (section) {
      setActive(categoryId);
      section.scrollIntoView({ 
        behavior: "smooth", 
        block: "start",
        inline: "nearest"
      });
    }
  }, [setActive]);

  // Scroll spy - update active tab based on scroll position
  useEffect(() => {
    if (!categories || categories.length === 0) return;

    const handleScroll = () => {
      // Debounce scroll events for better performance
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        const viewportHeight = window.innerHeight;
        let currentActive = "";
        let minDistance = Infinity;

        // Find the section that's most visible in the viewport
        for (const categoryId of categories) {
          const section = document.getElementById(categoryId);
          if (!section) continue;

          const rect = section.getBoundingClientRect();
          const distanceFromTop = Math.abs(rect.top);
          
          // Check if section is in viewport or near the top
          const isInViewport = rect.top <= 200 && rect.bottom >= 100;
          
          if (isInViewport && distanceFromTop < minDistance) {
            minDistance = distanceFromTop;
            currentActive = categoryId;
          }
        }

        // Only update if different from current active
        if (currentActive && currentActive !== active) {
          setActive(currentActive);
        }
      }, 100); // 100ms debounce
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Initial check after a short delay to ensure DOM is ready
    setTimeout(handleScroll, 100);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [categories, active, setActive]);

  // Auto-scroll active tab into view
  useEffect(() => {
    if (!tabsRef.current || !active) return;

    const activeTab = tabsRef.current.querySelector(`[data-category="${active}"]`);
    if (activeTab) {
      activeTab.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center"
      });
    }
  }, [active]);

  // Handle keyboard navigation
  const handleKeyDown = (e, categoryId, index) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      scrollToSection(categoryId);
    } else if (e.key === "ArrowRight" && index < categories.length - 1) {
      e.preventDefault();
      const nextCategory = categories[index + 1];
      scrollToSection(nextCategory);
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      const prevCategory = categories[index - 1];
      scrollToSection(prevCategory);
    }
  };

  // Format category name for display
  const formatCategoryName = (categoryId) => {
    return categoryId
      .replace(/-/g, " ")
      .replace(/_/g, " ")
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // If no categories, don't render
  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <div className="category-tabs-wrapper">
      <div className="category-tabs" ref={tabsRef}>
        {categories.map((category, index) => (
          <button
            key={category}
            data-category={category}
            className={`category-tab ${active === category ? "active-tab" : ""}`}
            onClick={() => scrollToSection(category)}
            onKeyDown={(e) => handleKeyDown(e, category, index)}
            aria-label={`Go to ${formatCategoryName(category)} section`}
            aria-current={active === category ? "location" : undefined}
            role="tab"
            tabIndex={0}
          >
            {formatCategoryName(category)}
          </button>
        ))}
      </div>
    </div>
  );
}

export default CategoryTabs;