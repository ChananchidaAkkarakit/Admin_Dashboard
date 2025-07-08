import LoginForm from "../components/LoginForm";
// LoginPage.tsx
type LoginPageProps = {
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function LoginPage({ setIsLoggedIn }: LoginPageProps) {
  return <LoginForm setIsLoggedIn={setIsLoggedIn} />;
}
