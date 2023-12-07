document.addEventListener("DOMContentLoaded", function () {
  const sidebar = document.querySelector("#sidebar");

  sidebar.addEventListener("click", (e) => {
    let toolButton = null;

    if (e.target.classList.contains("tool-button")) {
      toolButton = e.target;
    } else {
      toolButton = e.target.closest(".tool-button");
    }

    if (toolButton) {
      sidebar.querySelectorAll(".tool-button").forEach((el) => {
        el.classList.remove("selected");
      });
      toolButton.classList.add("selected");
    }
  });

  const colorButtons = document.querySelectorAll(".color-button");
  const selectedColorButton = document.querySelector(".selected-color-button");

  // Set initial background color for each color button
  colorButtons.forEach((button) => {
    const color = button.getAttribute("data-color");
    button.style.backgroundColor = color;

    // Click event for each color button
    button.addEventListener("click", function () {
      // Remove selected class from all color buttons
      colorButtons.forEach((btn) => btn.classList.remove("selected"));

      // Add selected class to clicked button
      this.classList.add("selected");

      // Update the selected color button's background color
      selectedColorButton.style.backgroundColor =
        this.getAttribute("data-color");
    });
  });
});