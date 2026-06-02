import './App.css';

function SocialLogin() {
  return (
    <>
      <section id="center">
        <div className="hero"></div>
        <div>
          <h1>Googleアカウントでログイン</h1>
          <a href={`${import.meta.env.VITE_API_BASE_URL}/oauth2/authorization/google`}>
            Googleでログイン
          </a>
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  );
}

export default SocialLogin;
