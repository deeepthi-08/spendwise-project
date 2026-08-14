import { render } from "@testing-library/react-native";
import LoginScreen from "../app/login";

describe("Login Screen", () => {
  it("renders SpendWise login screen", async () => {
    const { getByText } = await render(<LoginScreen />);

    expect(getByText("SpendWise")).toBeTruthy();
    expect(getByText("Login to your account")).toBeTruthy();
    expect(getByText("Login")).toBeTruthy();
    expect(getByText("Sign Up")).toBeTruthy();
  });
});
