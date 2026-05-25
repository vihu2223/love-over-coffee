// Mobile navigation
(function initMobileNav() {
  const navbar = document.querySelector(".navbar");
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.getElementById("main-nav");
  if (!navbar || !toggle || !menu) return;

  let backdrop = document.querySelector(".nav-backdrop");
  if (!backdrop) {
    backdrop = document.createElement("button");
    backdrop.type = "button";
    backdrop.className = "nav-backdrop";
    backdrop.setAttribute("aria-label", "Close menu");
    document.body.appendChild(backdrop);
  }

  function setNavOpen(open) {
    navbar.classList.toggle("nav-open", open);
    document.body.classList.toggle("nav-menu-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  function closeNav() {
    setNavOpen(false);
  }

  toggle.addEventListener("click", () => {
    setNavOpen(!navbar.classList.contains("nav-open"));
  });

  backdrop.addEventListener("click", closeNav);

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      if (window.matchMedia("(max-width: 768px)").matches) closeNav();
    });
  });

  window.addEventListener("resize", () => {
    if (window.matchMedia("(min-width: 769px)").matches) closeNav();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeNav();
  });
})();

// Smooth page transitions for in-site links
document.querySelectorAll("a.page-link").forEach((link) => {
  link.addEventListener("click", (e) => {
    const href = link.getAttribute("href");
    if (!href || href === "#") {
      e.preventDefault();
      return;
    }

    const targetUrl = link.href;
    if (targetUrl === window.location.href) {
      e.preventDefault();
      return;
    }

    e.preventDefault();
    document.body.classList.add("fade-out");
    setTimeout(() => {
      window.location.href = targetUrl;
    }, 500);
  });
});

document.querySelectorAll("nav a:not(.page-link)").forEach((link) => {
  link.addEventListener("click", (e) => {
    if (link.getAttribute("href") === "#") {
      e.preventDefault();
      alert("Navigation feature coming soon 🚀");
    }
  });
});

// Handle back button caching (bfcache)
window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    document.body.classList.remove("fade-out");
  }
});
  
  // Button click animation
  document.querySelectorAll(".btn").forEach(btn => {
    btn.addEventListener("click", () => {
      btn.style.transform = "scale(0.95)";
      setTimeout(() => btn.style.transform = "scale(1)", 100);
    });
  });

  //coffee animation
  const coffees = document.querySelectorAll(".coffee");

function moveToCenter(index) {
  coffees.forEach((img) => img.classList.remove("active"));
  const active = coffees[index];
  if (!active) return;

  active.classList.add("active");

  if (window.matchMedia("(min-width: 769px)").matches) {
    active.style.transform = "rotateY(360deg) scale(1.1)";
    setTimeout(() => {
      active.style.transform = "scale(1.1)";
    }, 600);
  } else {
    active.style.transform = "";
  }
}

// Detailed Menu Functionality
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('menuSearchInput');
  const catBtns = document.querySelectorAll('.cat-btn');
  const categoryGroups = document.querySelectorAll('.menu-category-group');
  
  // Only run if we are on the menu page
  if (!searchInput || categoryGroups.length === 0) return;

  // Zomato-style Category Scroll Spy
  const observerOptions = {
    root: null,
    rootMargin: '-180px 0px -60% 0px', // Adjust to trigger when title is near sticky nav
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const categoryId = entry.target.getAttribute('data-category');
        
        // Update active class on buttons
        catBtns.forEach(btn => btn.classList.remove('active'));
        
        const activeBtn = Array.from(catBtns).find(btn => btn.getAttribute('data-category') === categoryId);
        if (activeBtn) activeBtn.classList.add('active');
      }
    });
  }, observerOptions);

  categoryGroups.forEach(group => observer.observe(group));

  // Category Clicks (Scroll to Section)
  catBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedCategory = btn.getAttribute('data-category');

      if (selectedCategory === 'all') {
        // Scroll to top of menu
        const menuSection = document.getElementById('full-menu');
        if (menuSection) {
          const y = menuSection.getBoundingClientRect().top + window.scrollY - 20;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      } else {
        // Scroll to specific category
        const targetGroup = Array.from(categoryGroups).find(group => group.getAttribute('data-category') === selectedCategory);
        if (targetGroup) {
          targetGroup.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  // Search Functionality (Filter and pop to top)
  searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    
    // Always show all categories when searching so we can filter inside them
    categoryGroups.forEach(group => group.style.display = 'block');

    let firstMatch = null;

    categoryGroups.forEach(group => {
      const items = group.querySelectorAll('.menu-item');
      let hasVisibleItem = false;

      items.forEach(item => {
        const text = item.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
          item.style.display = 'block';
          hasVisibleItem = true;
          if (!firstMatch) firstMatch = group; // Keep track of first matching group
        } else {
          item.style.display = 'none';
        }
      });

      // Show/hide the entire category group based on whether it has visible items
      if (hasVisibleItem) {
        group.style.display = 'block';
      } else {
        group.style.display = 'none';
      }
    });

    // On start of search, pop the container up so results are visible
    if (searchTerm.trim() !== '' && firstMatch) {
      // Small delay to let rendering catch up
      setTimeout(() => {
        const menuContainer = document.querySelector('.menu-controls');
        if (menuContainer) {
            const y = menuContainer.getBoundingClientRect().top + window.scrollY - 10;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 50);
    }
  });
});