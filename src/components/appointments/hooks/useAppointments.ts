// @ts-nocheck
import dayjs from 'dayjs';
import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useQuery, useQueryClient } from 'react-query';

import { Appointment } from '../../../../../shared/types';
import { axiosInstance } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';
import { useUser } from '../../user/hooks/useUser';
import { AppointmentDateMap } from '../types';
import { getAvailableAppointments } from '../utils';

const option = {
  staleTime: 0,
  cacheTime: 300000,
};

// for when we need a query function for useQuery
async function getAppointments(
  year: string,
  month: string,
): Promise<Appointment[]> {
  const { data } = await axiosInstance.get(`/appointments/${year}/${month}`);
  return data;
}

// for incrementing MonthYear
function getUpdatedMonthYear(monthYear: MonthYear, monthIncrement: number) {
  // the clone is necessary to prevent mutation
  return monthYear.startDate.clone().add(monthIncrement, 'months');
}

// for storing current month / year details
interface MonthYear {
  startDate: dayjs.Dayjs; // first day of the month
  firstDOW: number; // day of week; 0 === Sunday
  lastDate: number; // last date of the month
  monthName: string; // name of the month
  month: string; // two digit month number
  year: string; // four digit year
}

// get calendar-relevant data for the month containing initialDate
function getMonthYearDetails(initialDate: dayjs.Dayjs): MonthYear {
  const month = initialDate.format('MM');
  const year = initialDate.format('YYYY');
  const startDate = dayjs(`${year}${month}01`);
  const firstDOW = Number(startDate.format('d'));
  const lastDate = Number(startDate.clone().endOf('month').format('DD'));
  const monthName = startDate.format('MMMM');
  return { startDate, firstDOW, lastDate, monthName, month, year };
}

interface UseAppointments {
  appointments: AppointmentDateMap;
  monthYear: MonthYear;
  updateMonthYear: (monthIncrement: number) => void;
  showAll: boolean;
  setShowAll: Dispatch<SetStateAction<boolean>>;
}

export function useAppointments(): UseAppointments {
  const currentDate = dayjs();
  const [monthYear, setMonthYear] = useState(getMonthYearDetails(currentDate));

  // TODO: update with useQuery!

  // for showing all appointments or just available ones
  const [showAll, setShowAll] = useState(false);
  const { user } = useUser();
  const selectFunc = useCallback(
    (data: AppointmentDateMap) => {
      return getAvailableAppointments(data, user);
    },
    [user],
  );

  const { data: appointments = [] } = useQuery(
    [queryKeys.appointments, monthYear.year, monthYear.month],
    () => getAppointments(monthYear.year, monthYear.month),
    {
      select: showAll ? undefined : selectFunc,
      ...option,
      refetchOnMount: true,
      refetchOnReconnect: true,
      refetchOnWindowFocus: true,
    },
  );
  // to update when user changes month in view
  const client = useQueryClient();

  useEffect(() => {
    client.prefetchQuery(
      [queryKeys.appointments, monthYear.year, Number(monthYear.month) + 1],
      () => getAppointments(n.year, n.month),
      option,
    );
  }, [client, monthYear]);

  function updateMonthYear(monthIncrement: number): void {
    setMonthYear((preData) => {
      const n = getMonthYearDetails(
        getUpdatedMonthYear(preData, monthIncrement),
      );
      return n;
    });
  }

  return { appointments, monthYear, updateMonthYear, showAll, setShowAll };
}
