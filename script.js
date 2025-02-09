document.addEventListener("DOMContentLoaded", () => {
    let allHeaders = new Set();
    let selectedHeaders = {};
    let orderedHeaders = [];
    let dataRows = [];

    document.getElementById('fileInput').addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            const lines = e.target.result.split("\n");
            dataRows = [];
            allHeaders.clear();
            orderedHeaders = [];

            let tempHeaders = []; // Stores headers for each block

            // Extract headers from all header lines and data
            lines.forEach(line => {
                if (line.startsWith("#")) {
                    tempHeaders = line.substring(1).trim().split(/\s+/);
                    tempHeaders.forEach(h => allHeaders.add(h));
                } else if (line.trim() !== "") {
                    let values = line.trim().split(/\s+/);
                    if (tempHeaders.length === values.length) {
                        dataRows.push({ headers: tempHeaders, values });
                    }
                }
            });

            orderedHeaders = Array.from(allHeaders).filter(h => h !== "Timestep"); // Remove Timestep from selection
            renderHeaderSelection();
        };

        reader.readAsText(file);
    });

    function renderHeaderSelection() {
        const container = document.getElementById("headerSelection");
        container.innerHTML = ""; // Clear previous selections

        orderedHeaders.forEach(header => {
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.id = header;
            checkbox.checked = true;
            checkbox.addEventListener("change", toggleDownloadButton);

            selectedHeaders[header] = checkbox;

            const label = document.createElement("label");
            label.innerHTML = header;
            label.setAttribute("for", header);

            const div = document.createElement("div");
            div.appendChild(checkbox);
            div.appendChild(label);
            container.appendChild(div);
        });

        toggleDownloadButton();
    }

    function toggleDownloadButton() {
        const anyChecked = Object.values(selectedHeaders).some(cb => cb.checked);
        document.getElementById("downloadBtn").disabled = !anyChecked;
    }

    window.selectAll = function() {
        Object.values(selectedHeaders).forEach(cb => cb.checked = true);
        toggleDownloadButton();
    }

    window.unselectAll = function() {
        Object.values(selectedHeaders).forEach(cb => cb.checked = false);
        toggleDownloadButton();
    }

    window.downloadXLSX = function() {
        if (dataRows.length === 0) {
            alert("No data to process. Please upload a valid file.");
            return;
        }

        let headers = ["Timestep", ...orderedHeaders.filter(h => selectedHeaders[h].checked)];
        let processedData = [];

        dataRows.forEach(({ headers: rowHeaders, values }) => {
            let rowData = {};
            rowData["Timestep"] = values[0] || "0"; // Always take first column as Timestep

            headers.slice(1).forEach(header => {
                const headerIndex = rowHeaders.indexOf(header);
                rowData[header] = headerIndex >= 0 && headerIndex < values.length ? values[headerIndex] : "0";
            });

            processedData.push(rowData);
        });

        generateExcel(headers, processedData);
    }

    function generateExcel(headers, data) {
        const ws = XLSX.utils.json_to_sheet(data, { header: headers });

        // Freeze the first row (headers)
        ws["!autofilter"] = { ref: `A1:${String.fromCharCode(65 + headers.length - 1)}1` };
        ws["!rows"] = [{ hidden: false }]; // Ensure headers are visible

        // Auto-adjust column widths
        ws["!cols"] = headers.map(header => ({ wch: header.length + 5 }));

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Data");

        XLSX.writeFile(wb, "Converted_File.xlsx");
    }
});
