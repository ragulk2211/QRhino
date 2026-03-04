import "../styles/header.css"

function Header() {

  return (

    <header className="header">

      <div className="logo">
        <h1>Food Menu</h1>
      </div>

      <div className="header-right">

        <input
          type="text"
          className="search"
          placeholder="Search food..."
        />

        <button className="cart">
          Cart
        </button>

      </div>

    </header>

  )

}

export default Header