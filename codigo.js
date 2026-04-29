let categorias = JSON.parse(localStorage.getItem("categorias")) || [];
let categoriaActual = "";

/* CREAR TIENDA */
function crearTienda() {
    let tienda = document.getElementById("tienda").value;
    let usuario = document.getElementById("usuario").value;
    let password = document.getElementById("password").value;

    if (!tienda || !usuario || !password) {
        alert("Completa todo");
        return;
    }

    localStorage.setItem("tienda", tienda);
    localStorage.setItem("usuario", usuario);
    localStorage.setItem("password", password);

    alert("Tienda creada");
}

/* LOGIN */
function iniciarSesion() {
    let usuario = document.getElementById("usuario").value;
    let password = document.getElementById("password").value;

    if (
        usuario === localStorage.getItem("usuario") &&
        password === localStorage.getItem("password")
    ) {
        // 🔥 QUITA EL FONDO
        document.body.classList.remove("login");

        panelPrincipal();
    } else {
        alert("Datos incorrectos");
    }
}

/* PANEL */
function panelPrincipal() {
    document.body.innerHTML = `
        <div class="panel">

            <div class="sidebar">
                <h2>Categorías</h2>

                <input id="nuevaCategoria" placeholder="Nueva categoría">

                <button onclick="agregarCategoria()">Crear</button>

                <div id="listaCategorias"></div>
            </div>

            <div class="contenido">
                <h1 id="tituloCategoria">Selecciona una categoría</h1>

                <div class="producto-inputs">
                    <input id="producto" placeholder="Producto">
                    <input id="cantidad" placeholder="Cantidad" type="number">
                    <input id="precio" placeholder="Precio" type="number">
                </div>

                <br>

                <button onclick="agregarProducto()">Agregar Producto</button>

                <table>
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Cantidad</th>
                            <th>Precio</th>
                        </tr>
                    </thead>
                    <tbody id="tablaProductos"></tbody>
                </table>
            </div>

        </div>
    `;

    renderCategorias();
}

/* CATEGORÍAS */
function agregarCategoria() {
    let nueva = document.getElementById("nuevaCategoria").value;

    if (!nueva) return;

    categorias.push(nueva);
    localStorage.setItem("categorias", JSON.stringify(categorias));
    document.getElementById("nuevaCategoria").value = "";
    renderCategorias();
}

function renderCategorias() {
    let lista = document.getElementById("listaCategorias");
    lista.innerHTML = "";

    categorias.forEach(cat => {
        lista.innerHTML += `
            <button onclick="abrirCategoria('${cat}')">
                ${cat}
            </button>
        `;
    });
}

/* PRODUCTOS */
function abrirCategoria(cat) {
    categoriaActual = cat;
    document.getElementById("tituloCategoria").innerText = cat;
    cargarProductos();
}

function agregarProducto() {
    if (!categoriaActual) {
        alert("Primero elige una categoría");
        return;
    }

    let producto = document.getElementById("producto").value;
    let cantidad = document.getElementById("cantidad").value;
    let precio = document.getElementById("precio").value;

    if (!producto || !cantidad || !precio) {
        alert("Completa todo");
        return;
    }

    let productos = JSON.parse(localStorage.getItem(categoriaActual)) || [];

    productos.push({
        producto,
        cantidad,
        precio
    });

    localStorage.setItem(categoriaActual, JSON.stringify(productos));

    document.getElementById("producto").value = "";
    document.getElementById("cantidad").value = "";
    document.getElementById("precio").value = "";

    cargarProductos();
}

function cargarProductos() {
    let tabla = document.getElementById("tablaProductos");
    let productos = JSON.parse(localStorage.getItem(categoriaActual)) || [];

    tabla.innerHTML = "";

    productos.forEach(p => {
        tabla.innerHTML += `
            <tr>
                <td>${p.producto}</td>
                <td>${p.cantidad}</td>
                <td>$${p.precio}</td>
            </tr>
        `;
    });
}