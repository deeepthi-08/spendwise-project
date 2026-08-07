import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import Home from "../app/page";

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([]),
  })
) as jest.Mock;

describe("SpendWise Dashboard", () => {
  test("renders SpendWise title", () => {
    render(<Home />);

    const title = screen.getByText(/SpendWise/);

    expect(title).toBeInTheDocument();
  });
});
// this is for add expense test

test("renders Add Expense section", () => {
  render(<Home />);

  const addExpenseHeading = screen.getByRole("heading", {
    name: "Add Expense",
  });

  expect(addExpenseHeading).toBeInTheDocument();
});
