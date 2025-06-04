const threadData = {
    'M0': {
        '0.25': { tapping: '0.20 mm', clearance: '0.30 mm' }
    },
    'M1': {
        '0.25': { tapping: '0.75 mm', clearance: '1.10 mm' }
    },
    'M2': {
        '0.4': { tapping: '1.60 mm', clearance: '2.20 mm' }
    },
    'M3': {
        '0.5': { tapping: '2.50 mm', clearance: '3.30 mm' }
    },
    'M4': {
        '0.7': { tapping: '3.30 mm', clearance: '4.30 mm' }
    },
    'M5': {
        '0.8': { tapping: '4.20 mm', clearance: '5.30 mm' }
    },
    'M6': {
        '1.0': { tapping: '5.00 mm', clearance: '6.40 mm' }
    },
   'M7': {
        '1.0': { tapping: '6.00 mm', clearance: '7.40 mm' }
    },
    'M8': {
        '1.25': { tapping: '6.75 mm', clearance: '8.40 mm' }
    },
    'M9': {
        '1.25': { tapping: '7.75 mm', clearance: '9.40 mm' }
    },
    'M10': {
        '1.5': { tapping: '8.5 mm', clearance: '10.5 mm' },
        '1.75': { tapping: '8.2 mm', clearance: '10.8 mm' },
        '2.0': { tapping: '8.0 mm', clearance: '11.0 mm' }
    },
    'M11': {
        '1.5': { tapping: '9.5 mm', clearance: '11.5 mm' },
        '1.75': { tapping: '9.2 mm', clearance: '11.8 mm' },
        '2.0': { tapping: '9.0 mm', clearance: '12.0 mm' }
    },
    'M12': {
        '1.5': { tapping: '10.5 mm', clearance: '12.5 mm' },
        '1.75': { tapping: '10.2 mm', clearance: '12.8 mm' },
        '2.0': { tapping: '10.0 mm', clearance: '13.0 mm' }
    },
   'M14': {
        '2.0': { tapping: '12.0 mm', clearance: '14.3 mm' }
    },
   'M16': {
        '2.0': { tapping: '14.0 mm', clearance: '16.3 mm' }
    },
   'M18': {
        '2.5': { tapping: '15.5 mm', clearance: '18.3 mm' }
    },
   'M20': {
        '2.5': { tapping: '17.5 mm', clearance: '20.3 mm' }
    },
   'M22': {
        '2.5': { tapping: '19.5 mm', clearance: '22.3 mm' }
    },
   'M24': {
        '3.0': { tapping: '21.0 mm', clearance: '24.3 mm' }
    },
   'M27': {
        '3.0': { tapping: '24.0 mm', clearance: '27.3 mm' }
    },
   'M30': {
        '3.5': { tapping: '26.5 mm', clearance: '30.3 mm' }
    },
   'M33': {
        '3.5': { tapping: '29.5 mm', clearance: '33.3 mm' }
    },
   'M36': {
        '4.0': { tapping: '32.0 mm', clearance: '36.3 mm' }
    },
   'M39': {
        '4.0': { tapping: '35.0 mm', clearance: '39.3 mm' }
    },
   'M42': {
        '4.5': { tapping: '37.5 mm', clearance: '42.3 mm' }
    },
   'M45': {
        '4.5': { tapping: '40.5 mm', clearance: '45.3 mm' }
    },
   'M48': {
        '5.0': { tapping: '43.0 mm', clearance: '48.3 mm' }
    },
   'M52': {
        '5.0': { tapping: '47.0 mm', clearance: '52.3 mm' }
    },
   'M56': {
        '5.5': { tapping: '50.5 mm', clearance: '56.3 mm' }
    },
   'M60': {
        '5.5': { tapping: '54.5 mm', clearance: '60.3 mm' }
    },
   'M64': {
        '6.0': { tapping: '58.0 mm', clearance: '64.3 mm' }
    },
   'M68': {
        '6.0': { tapping: '62.0 mm', clearance: '68.3 mm' }
    },
   'M72': {
        '6.0': { tapping: '66.0 mm', clearance: '72.3 mm' }
    },
   'M76': {
        '6.0': { tapping: '70.0 mm', clearance: '76.3 mm' }
    },
   'M80': {
        '6.0': { tapping: '74.0 mm', clearance: '80.3 mm' }
    },
   'M85': {
        '6.0': { tapping: '79.0 mm', clearance: '85.3 mm' }
    },
   'M90': {
        '6.0': { tapping: '84.0 mm', clearance: '90.3 mm' }
    },
   'M95': {
        '6.0': { tapping: '89.0 mm', clearance: '95.3 mm' }
    },
   'M100': {
        '6.0': { tapping: '94.0 mm', clearance: '100.3 mm' }
    },
};

function populateDropdowns() {
    const sizeSelect = document.getElementById('thread-size');
    const pitchSelect = document.getElementById('thread-pitch');

    if (!sizeSelect || !pitchSelect) {
        console.error("Dropdown elements not found in the DOM.");
        return;
    }

    const previouslySelectedSize = sizeSelect.value;
    const previouslySelectedPitch = pitchSelect.value;

    // Clear existing size options
    sizeSelect.innerHTML = '';

    // Populate size options
    for (const size in threadData) {
        if (threadData.hasOwnProperty(size)) {
            const option = document.createElement('option');
            option.value = size;
            option.text = size;
            sizeSelect.appendChild(option);

            if (previouslySelectedSize) {
                if (size === previouslySelectedSize) {
                    option.selected = true;
                }
            }
            else if (size === 'M10') {
                option.selected = true;
            }
        }
    }

    // Clear existing pitch options
    pitchSelect.innerHTML = '';

    // Populate pitch options based on the selected size
    const selectedSize = sizeSelect.value;
    if (threadData[selectedSize]) {
        for (const pitch in threadData[selectedSize]) {
            if (threadData[selectedSize].hasOwnProperty(pitch)) {
                const option = document.createElement('option');
                option.value = pitch;
                option.text = pitch;
                pitchSelect.appendChild(option);

                 if (pitch === previouslySelectedPitch) {
                    option.selected = true;
                }
            }
        }
    }
}

function calculateThread() {
    const sizeSelect = document.getElementById('thread-size');
    const size = sizeSelect.value;
    const pitchSelect = document.getElementById('thread-pitch');
    const pitch = pitchSelect.value;
    const resultDiv = document.getElementById('thread-result');

    // Get SVG elements
    const tappingSizeText = document.getElementById('tapping-size');
    const clearanceSizeText = document.getElementById('clearance-size');

    console.log(`Calculating thread for size: ${size}, pitch: ${pitch}`);

    // Check if both size and pitch have valid values
    if (size && pitch) {
        if (threadData[size] && threadData[size][pitch]) {
            const tapping = threadData[size][pitch].tapping;
            const clearance = threadData[size][pitch].clearance;
            resultDiv.innerHTML = `<b>Tapping Size:</b> ${tapping}<br><b>Clearance Size:</b> ${clearance}`;

            // Update SVG elements
            tappingSizeText.textContent = `${tapping}`;
            clearanceSizeText.textContent = `${clearance}`;

        } else {
            resultDiv.innerHTML = '<span style="color:red">No data for this size/pitch combination.</span>';
        }
    } else {
        resultDiv.innerHTML = '<span style="color:red">Please select both size and pitch.</span>';
    }
}

// Call populateDropdowns when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    populateDropdowns();
    calculateThread(); // Call calculateThread after populateDropdowns
});
