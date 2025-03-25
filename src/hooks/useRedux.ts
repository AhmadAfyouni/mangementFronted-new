"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { useMemo, useCallback } from "react";
import { AppDispatch, RootState } from "@/state/store";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useRedux = <TSelected = unknown>(
  selector?: (state: RootState) => TSelected
) => {
  const dispatch = useAppDispatch();
  const selectedState = useAppSelector((state) =>
    selector ? selector(state) : (state as unknown as TSelected)
  );

  const memoizedDispatch = useCallback(dispatch, [dispatch]);
  const memoizedSelector = useMemo(() => selectedState, [selectedState]);

  const dispatchAction = useCallback(
    <T>(actionCreator: (payload: T) => any, payload: T) => {
      return memoizedDispatch(actionCreator(payload));
    },
    [memoizedDispatch]
  );

  return {
    dispatch: memoizedDispatch,
    selector: memoizedSelector,
    dispatchAction,
  };
};
