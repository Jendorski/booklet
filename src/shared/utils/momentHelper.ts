/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import moment from 'moment';

export type TimeUnit =
    | 'year'
    | 'years'
    | 'y'
    | 'month'
    | 'months'
    | 'M'
    | 'week'
    | 'weeks'
    | 'w'
    | 'day'
    | 'days'
    | 'd'
    | 'hour'
    | 'hours'
    | 'h'
    | 'minute'
    | 'minutes'
    | 'm'
    | 'second'
    | 'seconds'
    | 's';

export type FormatUnit =
    | 'Do MMM'
    | 'Do MMM YYYY'
    | 'DD MMM'
    | 'Do MMMM'
    | 'YYYY-MM-DD'
    | 'YYYY-MM'
    | 'YYYY-MM-DD HH:mm'
    | 'YYYY-MM-DD HH'
    | 'HH:mm'
    | 'yyyy-MM-ddThh:mm:ssZ'
    | 'YYYY-MM-DDTHH:mm:ssZ';

const Moment = {
    today: () => moment().startOf('day'),
    endOfToday: () => moment(Moment.today()).endOf('day'),
    endOfDay: (thisTime: moment.MomentInput) =>
        moment(moment.utc(thisTime)).endOf('day'),
    startOfDay: (thisTime: moment.MomentInput) =>
        moment(moment.utc(thisTime)).startOf('day'),
    endOfWeek: (thisTime: moment.MomentInput) =>
        moment(moment.utc(thisTime)).endOf('week'),
    startOfWeek: (thisTime: moment.MomentInput) =>
        moment(moment.utc(thisTime)).startOf('week'),
    endOfMonth: (thisTime: moment.MomentInput) =>
        moment(moment.utc(thisTime)).endOf('month'),
    startOfMonth: (thisTime: moment.MomentInput) =>
        moment(moment.utc(thisTime)).startOf('month'),
    endOfYear: (thisTime: moment.MomentInput) =>
        moment(moment.utc(thisTime)).endOf('year'),
    startOfYear: (thisTime: moment.MomentInput) =>
        moment(moment.utc(thisTime)).startOf('year'),
    thisDayAgo: (howFarBehind: number) =>
        Moment.today().clone().subtract(howFarBehind, 'days'),
    subtract: (thisTime: moment.MomentInput, margin: number, unit: TimeUnit) =>
        moment.utc(thisTime).subtract(margin, unit),
    add: (thisTime: moment.MomentInput, margin: number, unit: TimeUnit) =>
        moment.utc(thisTime).add(margin, unit),
    minus: (margin: number, unit: TimeUnit) =>
        Moment.today().clone().subtract(margin, unit),
    plus: (margin: number, unit: TimeUnit) =>
        Moment.today().clone().add(margin, unit),
    thisDayToCome: (howFarAhead: number) =>
        moment().clone().add(howFarAhead, 'days'),
    thisTimeMetricToCome: (
        howFarAhead: number,
        metric: moment.unitOfTime.DurationConstructor
    ) => moment().clone().add(howFarAhead, metric),
    thisHourToCome: (howFarAhead: number) =>
        moment().clone().add(howFarAhead, 'hours'),
    thisHourBefore: (howFarBehind: number) =>
        moment().clone().subtract(howFarBehind, 'hours'),
    thisMinuteToCome: (howFarAhead: number) =>
        moment().clone().add(howFarAhead, 'minutes'),
    thisMinuteBefore: (howFarBehind: number) =>
        moment().clone().subtract(howFarBehind, 'minutes'),
    thisSecondsToCome: (howFarAhead: number) =>
        moment().clone().add(howFarAhead, 'seconds'),
    thisSecondsBefore: (howFarBehind: number) =>
        moment().clone().subtract(howFarBehind, 'seconds'),
    thisMonthsToCome: (howFarAhead: number) =>
        moment().clone().add(howFarAhead, 'months'),
    thisMonthsBefore: (howFarBehind: number) =>
        moment().clone().subtract(howFarBehind, 'months'),
    thisYearToCome: (howFarAhead: number) =>
        moment().clone().add(howFarAhead, 'years'),
    thisYearBefore: (howFarBehind: number) =>
        moment().clone().subtract(howFarBehind, 'years'),
    timeIn: (extratime: string | number, unit: TimeUnit) => {
        return moment.utc().add(extratime, unit).toLocaleString();
    },
    timeInISO: (extratime: string | number, unit: TimeUnit) => {
        return moment.utc().add(extratime, unit).toISOString();
    },
    isBeforeCurrentTime: (thisTime: moment.MomentInput) => {
        const theTime = moment.utc(thisTime);

        return moment().isBefore(theTime);
    },
    isAfterCurrentTime: (thisTime: moment.MomentInput) => {
        const theTime = moment.utc(thisTime);

        return moment().isAfter(theTime);
    },
    isSameOrBefore: (thisTime: moment.MomentInput) => {
        const theTime = moment.utc(thisTime);

        return moment().isSameOrBefore(theTime);
    },
    isSameOrAfter: (thisTime: moment.MomentInput) => {
        const theTime = moment.utc(thisTime);

        return moment().isSameOrAfter(theTime);
    },
    dateIsValid: (date: string, format: string) => {
        return moment(date, format).isValid();
    },
    findPreciseDifference: (dateString: string | Date, timeInput: TimeUnit) => {
        return moment().diff(
            //"YYYY-MM-DD HH:mm:ss"
            dateString,
            timeInput,
            true
        );
    },
    format: (dateString: string | Date, format: FormatUnit) =>
        moment(dateString).format(format).toString()
};

export default Moment;
