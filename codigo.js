// Cargar datos
let categorias = JSON.parse(localStorage.getItem("categorias")) || [];
let categoriaActual = "";
let defaultPorcentajeGananciaProducto = 20;

function formatMoney(number) {
    if (isNaN(number) || number === null) return "$ 0";
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(number);
}

/* PANTALLA DE LOGIN CORREGIDA */
function mostrarLogin() {
    const hayUsuario = localStorage.getItem("usuario");

    document.body.innerHTML = `
        <style>
            body { margin: 0; font-family: 'Segoe UI', sans-serif; background: #1a3a6d; display: flex; justify-content: center; align-items: center; height: 100vh; color: #333; }
            .login-card { background: white; padding: 40px; border-radius: 20px; box-shadow: 0 15px 35px rgba(0,0,0,0.4); width: 350px; text-align: center; }
            .login-card h2 { color: #1a3a6d; margin-bottom: 10px; }
            .login-card p { font-size: 0.9rem; color: #666; margin-bottom: 20px; }
            .login-card input { width: 100%; padding: 12px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 10px; box-sizing: border-box; font-size: 16px; }
            .btn-login { background: #27ae60; color: white; border: none; padding: 14px; width: 100%; border-radius: 10px; cursor: pointer; font-weight: bold; font-size: 16px; transition: 0.3s; }
            .btn-login:hover { background: #219150; }
            .reset-link { margin-top: 20px; display: block; color: #e74c3c; text-decoration: none; font-size: 0.8rem; cursor: pointer; opacity: 0.7; }
            .reset-link:hover { opacity: 1; }
        </style>
        <div class="login-card">
            <h2>${hayUsuario ? 'Bienvenido de nuevo' : 'Configurar Tienda'}</h2>
            <p>${hayUsuario ? 'Ingresa tus credenciales' : 'Crea tu cuenta de administrador'}</p>
            
            ${!hayUsuario ? '<input id="tienda" placeholder="Nombre de tu Negocio">' : ''}
            <input id="usuario" placeholder="Nombre de Usuario">
            <input id="password" type="password" placeholder="Tu Contraseña">
            
            <button class="btn-login" onclick="${hayUsuario ? 'iniciarSesion()' : 'crearTienda()'}">
                ${hayUsuario ? 'Entrar al Sistema' : 'Comenzar Ahora'}
            </button>

            <span class="reset-link" onclick="resetTotal()">⚠️ Borrar todo y empezar de cero</span>
        </div>
    `;
}

function crearTienda() {
    let tienda = document.getElementById("tienda").value;
    let user = document.getElementById("usuario").value;
    let pass = document.getElementById("password").value;

    if (!tienda || !user || !pass) return alert("Por favor, llena todos los campos");

    localStorage.setItem("tienda", tienda);
    localStorage.setItem("usuario", user);
    localStorage.setItem("password", pass);
    panelPrincipal();
}

function iniciarSesion() {
    let user = document.getElementById("usuario").value;
    let pass = document.getElementById("password").value;

    if (user === localStorage.getItem("usuario") && pass === localStorage.getItem("password")) {
        panelPrincipal();
    } else {
        alert("¡Error! Usuario o contraseña incorrectos.");
    }
}

/* BORRAR TODO SI TE QUEDAS TRABADO */
function resetTotal() {
    if (confirm("¿Estás seguro? Esto borrará tu usuario, tus categorías y todos tus productos para siempre.")) {
        localStorage.clear();
        location.reload();
    }
}

/* PANEL PRINCIPAL (TU INTERFAZ BELLA) */
function panelPrincipal() {
    const nombreTienda = localStorage.getItem("tienda") || "Mi Tienda";
    
    document.body.innerHTML = `
        <style>
            .panel { display: flex; gap: 20px; padding: 20px; font-family: 'Segoe UI', sans-serif; background: #f0f2f5; min-height: 100vh; color: #333; }
            .sidebar { width: 280px; background: #1a3a6d; padding: 20px; border-radius: 15px; color: white; height: fit-content; position: sticky; top: 20px; }
            .sidebar h2 { font-size: 1.3rem; margin-bottom: 25px; color: #fff; text-align: center; }
            .sidebar input { width: 100%; padding: 12px; border-radius: 10px; border: none; margin-bottom: 10px; box-sizing: border-box; }
            .btn-crear { background: #27ae60; color: white; border: none; padding: 12px; border-radius: 10px; cursor: pointer; width: 100%; font-weight: bold; }
            
            .categoria-item { display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.1); margin-bottom: 10px; border-radius: 10px; overflow: hidden; transition: 0.2s; }
            .categoria-item:hover { background: rgba(255,255,255,0.2); }
            .btn-cat { flex: 1; background: transparent; color: white; border: none; padding: 12px; text-align: left; cursor: pointer; font-size: 15px; }
            .btn-del { background: #e74c3c; color: white; border: none; padding: 12px 15px; cursor: pointer; font-size: 18px; }

            .contenido { flex: 1; background: white; padding: 30px; border-radius: 20px; box-shadow: 0 5px 20px rgba(0,0,0,0.05); }
            .producto-inputs { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 15px; margin-bottom: 25px; }
            .producto-inputs div { display: flex; flex-direction: column; }
            .producto-inputs label { font-size: 12px; font-weight: bold; margin-bottom: 5px; color: #888; text-transform: uppercase; }
            .producto-inputs input { padding: 12px; border: 1px solid #ddd; border-radius: 10px; font-size: 15px; }
            
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background: #f8f9fa; color: #1a3a6d; padding: 15px; text-align: left; font-size: 14px; border-bottom: 2px solid #eee; }
            td { padding: 15px; border-bottom: 1px solid #eee; font-size: 15px; }
            .total-box { margin-top: 30px; text-align: right; font-size: 1.8rem; font-weight: bold; color: #1a3a6d; }
            .btn-logout { background: transparent; color: #fff; border: 1px solid rgba(255,255,255,0.3); padding: 8px; width: 100%; margin-top: 20px; border-radius: 8px; cursor: pointer; font-size: 0.8rem; }
        </style>

        <div class="panel">
            <div class="sidebar">
                <h2>${nombreTienda}</h2>
                <input id="nuevaCategoria" placeholder="Nueva Categoría...">
                <button class="btn-crear" onclick="agregarCategoria()">+ Crear</button>
                <div id="listaCategorias" style="margin-top: 20px;"></div>
                <button class="btn-logout" onclick="location.reload()">Cerrar Sesión</button>
            </div>

            <div class="contenido">
                <h1 id="tituloCategoria" style="margin-top:0; color: #1a3a6d;">Selecciona una Categoría</h1>

                <div class="producto-inputs">
                    <div><label>Nombre del Producto</label><input id="producto" type="text" placeholder="Ej: Camiseta"></div>
                    <div><label>Cantidad</label><input id="cantidad" type="number" placeholder="0"></div>
                    <div><label>Costo (Base)</label><input id="costoBase" type="number" oninput="calcularSuma()" placeholder="3000"></div>
                    <div><label>Ganancia %</label><input id="porcentaje" type="number" value="${defaultPorcentajeGananciaProducto}" oninput="calcularSuma()"></div>
                    <div><label>Precio Venta</label><input id="precioFinal" readonly style="background: #f8fff9; color: #27ae60; font-weight: bold; border: 1px solid #27ae60;"></div>
                </div>

                <button onclick="agregarProducto()" style="background: #1a3a6d; color: white; border: none; padding: 15px 30px; border-radius: 10px; cursor: pointer; font-weight: bold; font-size: 16px;">
                    + Guardar Producto
                </button>

                <table>
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Cant.</th>
                            <th>Costo</th>
                            <th>%</th>
                            <th>Venta</th>
                            <th>Subtotal</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody id="tablaProductos"></tbody>
                </table>
                <div class="total-box">Total: <span id="totalVentaCategoria">$ 0</span></div>
            </div>
        </div>
    `;
    renderCategorias();
}

/* LÓGICA DE SUMA */
function calcularSuma() {
    let costo = parseFloat(document.getElementById("costoBase").value);
    let porcentaje = parseFloat(document.getElementById("porcentaje").value);
    let campoVenta = document.getElementById("precioFinal");

    if (!isNaN(costo) && !isNaN(porcentaje)) {
        let resultado = costo + (costo * (porcentaje / 100));
        campoVenta.value = Math.round(resultado);
    } else {
        campoVenta.value = "";
    }
}

/* GESTIÓN DE CATEGORÍAS */
function agregarCategoria() {
    let nombre = document.getElementById("nuevaCategoria").value.trim();
    if (!nombre || categorias.includes(nombre)) return;
    categorias.push(nombre);
    localStorage.setItem("categorias", JSON.stringify(categorias));
    renderCategorias();
    document.getElementById("nuevaCategoria").value = "";
}

function renderCategorias() {
    let lista = document.getElementById("listaCategorias");
    lista.innerHTML = "";
    categorias.forEach(cat => {
        lista.innerHTML += `
            <div class="categoria-item">
                <button class="btn-cat" onclick="abrirCategoria('${cat}')">${cat}</button>
                <button class="btn-del" onclick="eliminarCategoria('${cat}')">✕</button>
            </div>`;
    });
}

function abrirCategoria(cat) {
    categoriaActual = cat;
    document.getElementById("tituloCategoria").innerText = `Categoría: ${cat}`;
    cargarProductos();
}

function eliminarCategoria(cat) {
    if (confirm(`¿Eliminar "${cat}"?`)) {
        categorias = categorias.filter(c => c !== cat);
        localStorage.setItem("categorias", JSON.stringify(categorias));
        localStorage.removeItem(cat);
        renderCategorias();
        location.reload();
    }
}

/* GESTIÓN DE PRODUCTOS */
function agregarProducto() {
    if (!categoriaActual) return alert("Selecciona una categoría");
    
    let prod = {
        nombre: document.getElementById("producto").value,
        cant: parseFloat(document.getElementById("cantidad").value),
        costo: parseFloat(document.getElementById("costoBase").value),
        porc: parseFloat(document.getElementById("porcentaje").value),
        venta: parseFloat(document.getElementById("precioFinal").value)
    };

    if (!prod.nombre || isNaN(prod.cant) || isNaN(prod.costo)) return alert("Datos incompletos");

    let productos = JSON.parse(localStorage.getItem(categoriaActual)) || [];
    productos.push(prod);
    localStorage.setItem(categoriaActual, JSON.stringify(productos));
    
    document.getElementById("producto").value = "";
    document.getElementById("cantidad").value = "";
    document.getElementById("costoBase").value = "";
    cargarProductos();
}

function cargarProductos() {
    let productos = JSON.parse(localStorage.getItem(categoriaActual)) || [];
    let tabla = document.getElementById("tablaProductos");
    let totalV = 0;
    tabla.innerHTML = "";

    productos.forEach((p, index) => {
        let subV = p.cant * p.venta;
        totalV += subV;
        tabla.innerHTML += `
            <tr>
                <td>${p.nombre}</td>
                <td>${p.cant}</td>
                <td>${formatMoney(p.costo)}</td>
                <td>${p.porc}%</td>
                <td><strong>${formatMoney(p.venta)}</strong></td>
                <td>${formatMoney(subV)}</td>
                <td><button onclick="eliminarProducto(${index})" style="color:#e74c3c; background:none; border:none; cursor:pointer; font-size: 20px;">&times;</button></td>
            </tr>`;
    });
    document.getElementById("totalVentaCategoria").innerText = formatMoney(totalV);
}

function eliminarProducto(index) {
    let productos = JSON.parse(localStorage.getItem(categoriaActual));
    productos.splice(index, 1);
    localStorage.setItem(categoriaActual, JSON.stringify(productos));
    cargarProductos();
}

mostrarLogin();