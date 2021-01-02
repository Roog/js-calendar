class CalendarMonths {
    constructor(language) {
        let lang = language || navigator.language || "";
        this.changeLanguage(lang);
    }

    changeLanguage(lang) {
        switch (lang) {
            case "sv-SE":
                this._months = ["Jan", "Feb", "Mar", "Apr", "Maj", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                break;

            default:
                this._months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                break;
        }
    }

    get(value) {
        if (value || value === 0) {
            return this._months[value] || "NaN";
        }
        return this._months;
    }
}

class CalendarDays {
    constructor(language) {
        let lang = language || navigator.language || "";
        this.changeLanguage(lang);
    }

    changeLanguage(lang) {
        switch (lang) {
            case "sv-SE":
                this._days = ["Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"];
                break;

            default:
                this._days = ["Mon", "Thu", "Wed", "Thu", "Fri", "Sat", "Sun"];
                break;
        }
    }

    get(value) {
        if (value || value === 0) {
            return this._days[value] || "NaN";
        }
        return this._days;
    }
}

class Calendar {
    constructor(element, selectionCallback) {
        this.$containerElement = document.getElementById(element);
        this._selectedCallback = selectionCallback || (() => {});

        this.today = new Date();
        this.currentMonth = this.today.getMonth();
        this.currentYear = this.today.getFullYear();

        this.selectedDay = null;
        this.selectedMonth = this.currentMonth;
        this.selectedYear = this.currentYear;

        this.monthNames = new CalendarMonths().get();
        this.dayNames = new CalendarDays();

        this.renderMonths();
        this.renderCalendar(this.currentMonth, this.currentYear);
        this.listeners();
    }

    renderMonths() {
        // Months
        let $months = document.querySelector(".cal-months");
        $months.innerHTML = "";
        this.monthNames.forEach((monthName, i) => {
            let month = document.createElement("span");
            month.className = "month";
            month.id = `${i+1}`;
            month.innerHTML = ` ${monthName} `;

            if (this.currentMonth === i) {
                month.setAttribute("data-cal", "selected-month");
            } else {
                month.setAttribute("data-cal", "");
            }
            $months.append(month);
        });
    }

    renderCalendar(month, year) {
        // Days titles
        let $calendarHead = document.getElementById("calendar-head");
        $calendarHead.innerHTML = "";
        let headRow = document.createElement("tr");
        for (let h = 0; h < 7; h++) {
            let dayHead = document.createElement("th");
            let dateNum = document.createTextNode(this.dayNames.get(h));
            dayHead.appendChild(dateNum);
            dayHead.className = "days-of-week";
            headRow.appendChild(dayHead);
        }
        $calendarHead.appendChild(headRow);

        // Days table
        let date = 1;
        // let firstDayOfTheMonth = (new Date(year, month)).getDay(); // Sunday
        let firstDayOfTheMonth = ((new Date(year, month).getDay() + 6) % 7); // Monday
        let daysInMonth = 32 - new Date(year, month, 32).getDate();
        // console.log("#Now", daysInMonth, new Date(year, month), firstDayOfTheMonth);

        // TODO: should be last day
        // let firstDayOfThePrevMonth = ((new Date(year, month-1).getDay() + 6) % 7);
        // let daysInPrevMonth = 32 - new Date(year, month-1, 32).getDate();
        // console.log("#Prev", daysInPrevMonth, new Date(year, month-1), firstDayOfThePrevMonth);

        let firstDayOfTheNextMonth = ((new Date(year, month+1).getDay() + 6) % 7);
        let daysInNextMonth = 32 - new Date(year, month+1, 32).getDate();
        // console.log("#Next", daysInNextMonth, new Date(year, month+1), firstDayOfTheNextMonth)

        let $calFrag = document.createDocumentFragment();
        for (let i = 0; i < 6; i++) {
            let week = document.createElement("tr");

            for (let j = 0; j < 7; j++) {
                if (i === 0 && j < firstDayOfTheMonth) {
                    let day = document.createElement("td");
                    let dateNum = document.createTextNode("");
                    day.appendChild(dateNum);
                    week.appendChild(day);
                } else if (date > daysInMonth) {
                    if (j%7 === 0) {
                        break;
                    }
                    let day = document.createElement("td");
                    let dateNum = document.createTextNode("--");
                    day.appendChild(dateNum);
                    week.appendChild(day);
                } else if (date > 32) {
                    break;
                } else {
                    let day = document.createElement("td");
                    let dateNum = document.createTextNode(date);
                    if (date === this.today.getDate() && year === this.today.getFullYear() && month === this.today.getMonth()) {
                        day.title = "today";
                    }
                    day.appendChild(dateNum);
                    day.id = `${year}${String(month+1).padStart(2, '0')}${String(dateNum.textContent).padStart(2, '0')}`;
                    day.className = "dates";
                    day.draggable = true;

                    if (this.selectedDay === day.id || (this.selectedDay === null && day.title === "today")) {
                        day.setAttribute("data-cal", "selected-day");
                        this.selectedDay = day.id;
                    } else {
                        day.setAttribute("data-cal", "");
                    }
                    week.appendChild(day);
                    date++;
                }
            }
            $calFrag.appendChild(week);
        }
        let $calendarBody = document.getElementById("calendar-body");
        $calendarBody.innerHTML = "";
        $calendarBody.appendChild($calFrag);

        // Years title
        let $yearNum = document.getElementById("yearNum");
        $yearNum.innerHTML = `${year}`;
    }

    listeners() {
        // Year selection
        this.$containerElement.addEventListener("click", (e) => {
            if (e.target.className === "next-year") {
                e.preventDefault();
                e.stopImmediatePropagation();
                this.currentYear = this.currentYear + 1;
                this.renderCalendar(this.currentMonth, this.currentYear);
            } else if (e.target.className === "previous-year") {
                e.preventDefault();
                e.stopImmediatePropagation();
                this.currentYear = this.currentYear - 1;
                this.renderCalendar(this.currentMonth, this.currentYear);
            }
        });

        // Month selection
        let $months = document.querySelector(".cal-months");
        $months.addEventListener("click", (e) => {
            e.stopPropagation();
            e.stopImmediatePropagation();

            if (e.target.className === "month") {
                let data = $months.querySelectorAll("[data-cal='selected-month']");
                data.forEach((item) => {
                    item.dataset.cal = "";
                });

                e.target.dataset.cal = "selected-month";

                this.currentMonth = e.target.id-1;
                this.currentYear = this.currentYear;
                this.renderCalendar(this.currentMonth, this.currentYear);
            }
        });

        // Day selection
        let $calendarBody = document.getElementById("calendar-body");
        $calendarBody.addEventListener("click", (e) => {
            e.stopPropagation();
            e.stopImmediatePropagation();

            let data = $calendarBody.querySelectorAll("[data-cal='selected-day']");
            data.forEach((item) => {
                item.dataset.cal = "";
            });

            e.target.dataset.cal = "selected-day";

            // set selected day
            this.selectedDay = e.target.id;
            this.selectedYear = this.currentYear;
            this.selectedMonth = this.currentMonth;

            // fire user callback
            this._selectedCallback(this.selectedDay);
        });
    }

    moveView() {
        this.currentMonth = this.selectedMonth;
        this.currentYear = this.selectedYear;
        this.renderMonths();
        this.renderCalendar(this.selectedMonth, this.selectedYear);
    }
}

const cal = new Calendar("mycalendar", (selected) => {
    // Selected date callback
    console.log(`Date selected callback ${selected}`);
});

document.getElementById("reset-view").addEventListener("click", () => {
    cal.moveView();
});
