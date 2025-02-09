document.addEventListener("DOMContentLoaded", () => {
    let searchInput = null;
    let matchToggle = null;
    let matchToggleCheckbox = null;
    let previewSection = null;
    let checkboxesContainer = null;

    document.getElementById("fileInput").addEventListener("change", function () {
        const headerContainer = document.getElementById("headerSelection");

        if (!searchInput) {
            // Create the search input
            searchInput = document.createElement("input");
            searchInput.type = "text";
            searchInput.placeholder = "Search headers...";
            searchInput.style.width = "100%";
            searchInput.style.padding = "8px";
            searchInput.style.marginBottom = "10px";

            // Create the match toggle switch
            matchToggle = document.createElement("label");
            matchToggle.style.display = "block";
            matchToggle.style.marginBottom = "10px";
            matchToggle.style.fontSize = "14px";

            matchToggleCheckbox = document.createElement("input");
            matchToggleCheckbox.type = "checkbox";
            matchToggleCheckbox.style.marginRight = "5px";

            matchToggle.appendChild(matchToggleCheckbox);
            matchToggle.appendChild(document.createTextNode(" Full Match"));

            // Insert elements above the headers list
            headerContainer.parentElement.insertBefore(searchInput, headerContainer);
            headerContainer.parentElement.insertBefore(matchToggle, headerContainer);
        }

        if (!previewSection) {
            // Create the preview section BELOW the headers selection
            previewSection = document.createElement("div");
            previewSection.style.marginTop = "15px";
            previewSection.style.padding = "10px";
            previewSection.style.border = "1px solid #ccc";
            previewSection.style.maxHeight = "150px";
            previewSection.style.overflowY = "auto";
            previewSection.style.fontSize = "14px";
            previewSection.innerHTML = "<strong>Selected Headers:</strong><br><span id='previewHeaders'>None</span>";

            // Insert preview BELOW the header selection
            headerContainer.parentElement.appendChild(previewSection);
        }

        // Store the container of checkboxes for better filtering
        checkboxesContainer = document.getElementById("headerSelection");

        searchInput.addEventListener("input", function () {
            filterHeaders(searchInput.value.toLowerCase());
        });

        matchToggleCheckbox.addEventListener("change", function () {
            filterHeaders(searchInput.value.toLowerCase());
        });

        // Wait a bit before updating preview to ensure checkboxes are created
        setTimeout(updatePreview, 200);
    });

    function filterHeaders(searchTerm) {
        if (!checkboxesContainer) return;

        const checkboxes = checkboxesContainer.querySelectorAll("div");
        const isFullMatch = matchToggleCheckbox.checked;

        checkboxes.forEach(div => {
            const label = div.querySelector("label");
            if (label) {
                const text = label.innerText.toLowerCase();
                const match = isFullMatch ? text === searchTerm : text.includes(searchTerm);
                div.style.display = match ? "block" : "none";
            }
        });

        updatePreview();
    }

    function updatePreview() {
        if (!checkboxesContainer) return;

        // Get all selected headers (even those hidden due to search)
        const checkboxes = checkboxesContainer.querySelectorAll("input[type='checkbox']");
        const selectedHeaders = Array.from(checkboxes)
            .filter(cb => cb.checked) // Include all checked, even hidden ones
            .map(cb => cb.id);

        document.getElementById("previewHeaders").innerText =
            selectedHeaders.length > 0 ? selectedHeaders.join(", ") : "None";
    }

    document.getElementById("headerSelection").addEventListener("change", updatePreview);

    // Modify selectAll and unselectAll functions to update preview
    window.selectAll = function() {
        if (!checkboxesContainer) return;

        const checkboxes = checkboxesContainer.querySelectorAll("input[type='checkbox']");
        checkboxes.forEach(cb => {
            cb.checked = true;
            cb.parentElement.style.display = "block"; // Ensure all are visible
        });

        updatePreview();
    };

    window.unselectAll = function() {
        if (!checkboxesContainer) return;

        const checkboxes = checkboxesContainer.querySelectorAll("input[type='checkbox']");
        checkboxes.forEach(cb => cb.checked = false);

        updatePreview();
    };
});
