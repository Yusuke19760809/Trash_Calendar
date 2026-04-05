// Constants based on the image provided
const REST_DAYS = ['2026-05-04', '2026-05-05', '2027-01-01', '2027-01-02'];

// Fiscal Year limits
const START_YEAR = 2026;
const START_MONTH = 4; // April
const END_YEAR = 2027;
const END_MONTH = 3;   // March

let currentYear = START_YEAR;
let currentMonth = START_MONTH;

/**
 * Returns the garbage collection rule mapped directly from the rules in the image.
 * rule1: Burnable (Wed/Sat)
 * rule2: Recyclables (2nd, 4th Tue)
 * rule3: Plastics (1st, 3rd Tue)
 * rule4: Rest days override all
 */
const getGarbageType = (year, month, date) => {
    const dStr = `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`;

    // Check for explicit non-collection resting days
    if (REST_DAYS.includes(dStr)) {
        return { type: 'rest', label: 'お休み' };
    }

    const d = new Date(year, month - 1, date);
    const day = d.getDay(); // 0: Sun, 1: Mon, 2: Tue, 3: Wed, 4: Thu, 5: Fri, 6: Sat

    // Burnable is every Wednesday and Saturday
    if (day === 3 || day === 6) {
        return { type: 'burnable', label: '可燃ごみ' };
    }

    // Recyclable/Plastic splits the Tuesdays
    if (day === 2) { // Tuesday
        const nth = Math.ceil(date / 7); // Calculate which Tuesday of the month
        if (nth === 1 || nth === 3) {
            return { type: 'plastic', label: 'プラスチック類' }; // Image label
        } else if (nth === 2 || nth === 4) {
            return { type: 'recyclable', label: '資源物・不燃' }; // Image label
        }
    }

    // Nothing collected on Sunday, Monday, Thursday, Friday (except burnable), and 5th Tuesday
    return null;
};

// DOM Elements wrapping with jQuery
let $monthDisplay;
let $daysContainer;
let $prevBtn;
let $nextBtn;

const updateCalendar = () => {
    $monthDisplay.text(`${currentYear}年 ${currentMonth}月`);

    // Disable navigating out of the 2026 Fiscal Year
    $prevBtn.prop('disabled', currentYear === START_YEAR && currentMonth === START_MONTH);
    $nextBtn.prop('disabled', currentYear === END_YEAR && currentMonth === END_MONTH);

    // Render calendar dates
    $daysContainer.empty();
    const firstDay = new Date(currentYear, currentMonth - 1, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

    // Fill empty grid cells before the 1st of the month
    for (let i = 0; i < firstDay; i++) {
        $daysContainer.append($('<div>').addClass('day empty'));
    }

    // Create daily cells
    for (let i = 1; i <= daysInMonth; i++) {
        const dStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const dateObj = new Date(currentYear, currentMonth - 1, i);
        const dayOfWeek = dateObj.getDay();

        // Start base class
        const $dayDiv = $('<div>').addClass('day');
        if (dayOfWeek === 0) $dayDiv.addClass('holiday');
        if (dayOfWeek === 6) $dayDiv.addClass('saturday');

        // Note: We style explicit REST DAYS as "holiday" in UI
        if (REST_DAYS.includes(dStr)) {
            $dayDiv.addClass('holiday').removeClass('saturday');
        }

        // Add date number
        $dayDiv.append($('<div>').addClass('date-num').text(i));

        // Fetch category and present
        const garbage = getGarbageType(currentYear, currentMonth, i);
        if (garbage) {
            if (garbage.type === 'rest') {
                $dayDiv.append($('<span>').addClass('rest-chip').text(garbage.label));
            } else {
                $dayDiv.append($('<div>').addClass(`chip ${garbage.type}`).text(garbage.label));
            }
        }

        $daysContainer.append($dayDiv);
    }

    // Fill trailing empty slots for cleaner grid ending
    const totalCells = firstDay + daysInMonth;
    const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let i = 0; i < remaining; i++) {
        $daysContainer.append($('<div>').addClass('day empty'));
    }
};

// Initialization
$(document).ready(() => {
    // Initialize DOM variables
    $monthDisplay = $('#current-month-display');
    $daysContainer = $('#calendar-days');
    $prevBtn = $('#prev-btn');
    $nextBtn = $('#next-btn');

    // Event Listeners for controls
    $prevBtn.on('click', () => {
        if (currentMonth === 1) {
            currentMonth = 12;
            currentYear--;
        } else {
            currentMonth--;
        }
        updateCalendar();
    });

    $nextBtn.on('click', () => {
        if (currentMonth === 12) {
            currentMonth = 1;
            currentYear++;
        } else {
            currentMonth++;
        }
        updateCalendar();
    });

    updateCalendar();
});
