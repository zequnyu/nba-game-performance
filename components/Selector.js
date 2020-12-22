import { useState, useContext } from 'react';
import { useRouter } from 'next/router'

import moment from 'moment';

import { NBAContext } from '../lib/utils';

import DatePicker from '../components/DatePicker';

function ShootingMap({ goTo }) {
    const [g] = useContext(NBAContext);
    const [selectedDate, setSelectedDate] = useState(new Date(g.season.startDate));

    const router = useRouter();

    return (
        <div>
            <DatePicker 
                minDateStr={g.season.startDate} 
                maxDateStr={g.season.endDate} 
                selectedDate={selectedDate}
                setSelectedDate={ (date) => { setSelectedDate(date) }}
            />
            <button 
                className="button is-light" 
                onClick={() => { 
                    router.push('/')
                }}
            >
                Back
            </button>
            <button 
                className="button is-light" 
                onClick={() => { 
                    const d = moment(selectedDate).format('YYYYMMDD')
                    router.push(`/${goTo}/`+d)
                }}
            >
                Go
            </button>
        </div>
    )
}

export default ShootingMap;
