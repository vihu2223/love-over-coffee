// Smooth scroll
document.querySelectorAll("nav a").forEach(link => {
    link.addEventListener("click", () => {
      alert("Navigation feature coming soon 🚀");
    });
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
  coffees.forEach((img, i) => {
    img.classList.remove("active");
  });

  coffees[index].classList.add("active");

  // rotation effect 🔥
  coffees[index].style.transform = "rotateY(360deg) scale(1.1)";
  
  setTimeout(() => {
    coffees[index].style.transform = "scale(1.1)";
  }, 600);
}