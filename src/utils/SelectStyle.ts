/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

export const selectStyle = {
  control: (base) => ({
    ...base,
    backgroundColor: "var(--color-main)",
    borderColor: "var(--color-dark)",
    color: "white",
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: "var(--color-dark)",
    color: "var(--color-twhite)",
  }),
  menuList: (base) => ({
    ...base,
    color: "white",
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused
      ? "var(--color-secondary)"
      : "var(--color-dark)",
    color: "var(--color-twhite)",
    cursor: "pointer",
  }),
  singleValue: (base) => ({
    ...base,
    color: "var(--color-twhite)",
  }),
  placeholder: (base) => ({
    ...base,
    color: "var(--color-twhite)",
  }),
};
