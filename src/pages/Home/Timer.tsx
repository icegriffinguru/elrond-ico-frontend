import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { ProgressBar } from 'react-bootstrap';


const Timer = (props: any) => {
    const Ref = useRef<any>(null);
    const [timer, setTimer] = useState('10:05:34:58');
    const [timeRemaining, settimeRemaining] = useState(0);
    const [completed, setCompleted] = useState(0);

    const getTimeRemaining = (e: Date) => {
        const total = e.getTime() - (new Date()).getTime();
        setCompleted(Math.floor(total/ props.maxtimeRemaining / 10 ));
        const seconds = Math.floor((total / 1000) % 60);
        const minutes = Math.floor((total / 1000 / 60) % 60);
        const hours = Math.floor((total / 1000 / 60 / 60) % 24);
        const days = Math.floor((total / 1000 / 60 / 60 / 24));
        return {
            total, days, hours, minutes, seconds
        };
    };

    const startTimer = (e: Date) => {
        const { total, days, hours, minutes, seconds }
            = getTimeRemaining(e);
        if (total >= 0) {
            setTimer(
                (days) + ':' +
                (hours > 9 ? hours : '0' + hours) + ':' +
                (minutes > 9 ? minutes : '0' + minutes) + ':'
                + (seconds > 9 ? seconds : '0' + seconds)
            );
        }
        if(props.timeRemaining > 0 && total <= 0) {
            handleComplete();
        }
    };

    const clearTimer = (e: Date) => {
        if (Ref.current) clearInterval(Ref.current);
        const id = setInterval(() => {
            startTimer(e);
        }, 1000);
        Ref.current = id;
    };

    const getDeadTime = () => {
        const deadline = new Date();

        deadline.setSeconds(deadline.getSeconds() + timeRemaining);
        return deadline;
    };

    const handleComplete = () => {
        props.onComplete();
    };

    useEffect(() => {
        settimeRemaining(props.timeRemaining);
        clearTimer(getDeadTime());
    }, [timeRemaining]);

    return (
        <div className="token-sale-timer-container">
            <div className='token-sale-timer'>{timer}</div>
        </div>
    );
};

export default Timer;