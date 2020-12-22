import { forwardRef } from 'react';
import DatePicker from "react-datepicker";
import moment from 'moment';

import "react-datepicker/dist/react-datepicker.css";
import styles from '../styles/DatePicker.module.css';

const CustomDatePicker = forwardRef(({ value, onClick }, ref) => (
    <button className="button is-light" ref={ref} onClick={onClick}>
        {value}
    </button>
));

CustomDatePicker.displayName = 'CustomDatePicker';

function DatePickerComponent({ 
    minDateStr,
    maxDateStr, 
    selectedDate,
    setSelectedDate,
    disabledDatesStr = []
}) {
    return (
        <div className={styles.datePicker}>
            <DatePicker
                selected={selectedDate} 
                onChange={date => setSelectedDate(date)}
                customInput={<CustomDatePicker />}
                dateFormat="yyyyMMdd"
                minDate={new Date(minDateStr)}
                maxDate={new Date(maxDateStr)}
                excludeDates={disabledDatesStr.map(d => moment(d, 'YYYYMMDD').toDate())}
            />
        </div>
    );
}

export default DatePickerComponent;
