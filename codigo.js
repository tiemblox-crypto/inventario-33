// ==========================================
// CONFIGURACIÓN INICIAL Y DATOS
// ==========================================
let categorias = JSON.parse(localStorage.getItem("categorias")) || [];
let categoriaActual = "";
let defaultPorcentajeGananciaProducto = 20;
let editandoIndex = -1; 

function formatMoney(number) {
    if (isNaN(number) || number === null) return "$ 0";
    return new Intl.NumberFormat('es-CO', {
        style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0
    }).format(number);
}

function calcularGranTotal() {
    let granTotal = 0;
    categorias.forEach(cat => {
        let productos = JSON.parse(localStorage.getItem(cat)) || [];
        productos.forEach(p => { granTotal += (p.cant * p.venta); });
    });
    const elemento = document.getElementById("granTotalGlobal");
    if (elemento) elemento.innerText = "Gran Total: " + formatMoney(granTotal);
}

// ==========================================
// PANTALLA DE ACCESO
// ==========================================
function mostrarLogin() {
    const hayUsuario = localStorage.getItem("usuario");
    document.body.innerHTML = `
        <style>
            body { margin: 0; font-family: 'Segoe UI', sans-serif; background: #1a3a6d; display: flex; justify-content: center; align-items: center; height: 100vh; }
            .login-card { background: white; padding: 40px; border-radius: 20px; box-shadow: 0 15px 35px rgba(0,0,0,0.4); width: 350px; text-align: center; }
            .login-card input { width: 100%; padding: 12px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 10px; box-sizing: border-box; font-size: 16px; }
            .btn-login { background: #27ae60; color: white; border: none; padding: 14px; width: 100%; border-radius: 10px; cursor: pointer; font-weight: bold; }
        </style>
        <div class="login-card">
            <h2 style="color:#1a3a6d">${hayUsuario ? 'Bienvenido' : 'Nueva Tienda'}</h2>
            ${!hayUsuario ? '<input id="tienda" placeholder="Nombre del Negocio">' : ''}
            <input id="usuario" placeholder="Usuario">
            <input id="password" type="password" placeholder="Contraseña">
            <button class="btn-login" onclick="${hayUsuario ? 'iniciarSesion()' : 'crearTienda()'}">Entrar</button>
            <p onclick="resetTotal()" style="color:red; font-size:10px; cursor:pointer; margin-top:20px; opacity:0.5">Borrar Sistema</p>
        </div>
    `;
}

function crearTienda() {
    let tienda = document.getElementById("tienda").value;
    let user = document.getElementById("usuario").value;
    let pass = document.getElementById("password").value;
    if (!tienda || !user || !pass) return alert("Completa los datos");
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
    } else { alert("Datos incorrectos"); }
}

// ==========================================
// PANEL PRINCIPAL
// ==========================================
function panelPrincipal() {
    const nombreTienda = localStorage.getItem("tienda") || "Mi Tienda";
    document.body.innerHTML = `
        <style>
            body { margin: 0; font-family: 'Segoe UI', sans-serif; background: #f0f2f5; }
            .panel { display: flex; width: 100%; min-height: 100vh; }
            
            /* Lateral */
            .sidebar { width: 300px; background: #1a3a6d; color: white; display: flex; flex-direction: column; padding: 20px; box-sizing: border-box; }
            .sidebar h2 { text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 15px; }
            .sidebar input { width: 100%; padding: 12px; border-radius: 8px; border: none; margin-bottom: 10px; }
            
            .btn-crear { background: #27ae60; color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; width: 100%; font-weight: bold; margin-bottom: 20px; }
            
            .btn-cat { width: 100%; background: rgba(255,255,255,0.1); color: white; border: none; padding: 15px; text-align: left; cursor: pointer; margin-bottom: 5px; border-radius: 8px; font-size: 15px; transition: 0.3s; }
            .btn-cat:hover { background: rgba(255,255,255,0.2); }

            /* Contenido */
            .contenido { flex: 1; background: white; padding: 40px; box-sizing: border-box; }
            
            /* Cabecera con el botón de borrar que pediste */
            .header-categoria { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 2px solid #f0f2f5; padding-bottom: 15px; }
            .btn-eliminar-cat { background: #ffe9e9; color: #e74c3c; border: 1px solid #e74c3c; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; display: none; }
            .btn-eliminar-cat:hover { background: #e74c3c; color: white; }

            .producto-inputs { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 15px; margin-bottom: 25px; }
            .producto-inputs div { display: flex; flex-direction: column; }
            .producto-inputs label { font-size: 11px; font-weight: bold; color: #888; text-transform: uppercase; margin-bottom: 5px; }
            .producto-inputs input { padding: 12px; border: 1px solid #ddd; border-radius: 10px; font-size: 15px; }
            
            table { width: 100%; border-collapse: collapse; }
            th { background: #f8f9fa; padding: 15px; text-align: left; border-bottom: 2px solid #eee; }
            td { padding: 15px; border-bottom: 1px solid #eee; }

            .total-box { margin-top: 30px; text-align: right; font-size: 2rem; font-weight: bold; color: #1a3a6d; }
            .btn-logout { background: transparent; border: 1px solid rgba(255,255,255,0.3); color: white; padding: 10px; cursor: pointer; border-radius: 8px; margin-top: 10px; }
        </style>

        <div class="panel">
            <div class="sidebar">
                <h2>${nombreTienda}</h2>
                <input id="nuevaCategoria" placeholder="Nombre Categoría...">
                <button class="btn-crear" onclick="agregarCategoria()">+ Crear Categoría</button>
                <div id="listaCategorias" style="flex: 1; overflow-y: auto;"></div>
                
                <div id="granTotalGlobal" style="background:#27ae60; padding:15px; border-radius:10px; text-align:center; font-weight:bold;">Gran Total: $ 0</div>
                <button class="btn-logout" onclick="location.reload()">Cerrar Sesión</button>
            </div>

            <div class="contenido">
                <div class="header-categoria">
                    <h1 id="tituloCategoria" style="margin:0; color:#1a3a6d">Selecciona una Categoría</h1>
                    <button id="btnEliminarCat" class="btn-eliminar-cat" onclick="eliminarCategoria()">🗑️ Eliminar Categoría</button>
                </div>

                <div class="producto-inputs">
                    <div><label>Producto</label><input id="producto" placeholder="Ej: Dulces"></div>
                    <div><label>Cantidad</label><input id="cantidad" type="number" placeholder="0"></div>
                    <div><label>Costo</label><input id="costoBase" type="number" oninput="calcularSuma()" placeholder="0"></div>
                    <div><label>Ganancia %</label><input id="porcentaje" type="number" value="20" oninput="calcularSuma()"></div>
                    <div><label>Venta</label><input id="precioFinal" readonly style="background:#f8fff9; color:#27ae60; font-weight:bold"></div>
                </div>

                <button id="btnGuardar" onclick="agregarProducto()" style="background:#1a3a6d; color:white; border:none; padding:15px; width:100%; border-radius:10px; cursor:pointer; font-weight:bold; font-size:16px;">+ Guardar Producto</button>
                
                <table style="margin-top:30px">
                    <thead><tr><th>Producto</th><th>Cant.</th><th>Costo</th><th>%</th><th>Venta</th><th>Subtotal</th><th>Acciones</th></tr></thead>
                    <tbody id="tablaProductos"></tbody>
                </table>
                <div class="total-box">Total: <span id="totalVentaCategoria">$ 0</span></div>
            </div>
        </div>
    `;
    renderCategorias();
    calcularGranTotal();
}

// ==========================================
// LÓGICA
// ==========================================
function calcularSuma() {
    let costo = parseFloat(document.getElementById("costoBase").value) || 0;
    let porcentaje = parseFloat(document.getElementById("porcentaje").value) || 0;
    document.getElementById("precioFinal").value = Math.round(costo + (costo * (porcentaje / 100)));
}

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
        lista.innerHTML += `<button class="btn-cat" onclick="abrirCategoria('${cat}')">${cat}</button>`;
    });
}

function abrirCategoria(cat) {
    categoriaActual = cat;
    document.getElementById("tituloCategoria").innerText = `Categoría: ${cat}`;
    document.getElementById("btnEliminarCat").style.display = "block"; // Mostrar el botón de borrar
    limpiarFormulario();
    cargarProductos();
}

function eliminarCategoria() {
    if (confirm(`¿Estás seguro de eliminar "${categoriaActual}" y todos sus productos?`)) {
        categorias = categorias.filter(c => c !== categoriaActual);
        localStorage.setItem("categorias", JSON.stringify(categorias));
        localStorage.removeItem(categoriaActual);
        location.reload(); // Recarga para limpiar la pantalla
    }
}

function agregarProducto() {
    if (!categoriaActual) return alert("Selecciona una categoría");
    let nombre = document.getElementById("producto").value.trim();
    if (!nombre) return alert("Nombre obligatorio");

    let prod = {
        nombre: nombre,
        cant: parseFloat(document.getElementById("cantidad").value) || 0,
        costo: parseFloat(document.getElementById("costoBase").value) || 0,
        porc: parseFloat(document.getElementById("porcentaje").value) || 0,
        venta: parseFloat(document.getElementById("precioFinal").value) || 0
    };

    let productos = JSON.parse(localStorage.getItem(categoriaActual)) || [];
    if (editandoIndex > -1) { productos[editandoIndex] = prod; editandoIndex = -1; } 
    else { productos.push(prod); }

    localStorage.setItem(categoriaActual, JSON.stringify(productos));
    limpiarFormulario(); cargarProductos(); calcularGranTotal();
}

function cargarProductos() {
    let productos = JSON.parse(localStorage.getItem(categoriaActual)) || [];
    let tabla = document.getElementById("tablaProductos");
    let totalV = 0; tabla.innerHTML = "";

    productos.forEach((p, i) => {
        let sub = p.cant * p.venta; totalV += sub;
        tabla.innerHTML += `<tr>
            <td>${p.nombre}</td><td>${p.cant}</td><td>${formatMoney(p.costo)}</td><td>${p.porc}%</td>
            <td><strong>${formatMoney(p.venta)}</strong></td><td>${formatMoney(sub)}</td>
            <td>
                <button style="border:none; background:#e3fcef; color:#27ae60; padding:5px; border-radius:5px; cursor:pointer" onclick="prepararEdicion(${i})">📝</button>
                <button style="border:none; background:#ffe9e9; color:#e74c3c; padding:5px; border-radius:5px; cursor:pointer" onclick="eliminarProducto(${i})">🗑️</button>
            </td>
        </tr>`;
    });
    document.getElementById("totalVentaCategoria").innerText = formatMoney(totalV);
}

function prepararEdicion(i) {
    let p = JSON.parse(localStorage.getItem(categoriaActual))[i];
    document.getElementById("producto").value = p.nombre;
    document.getElementById("cantidad").value = p.cant;
    document.getElementById("costoBase").value = p.costo;
    document.getElementById("porcentaje").value = p.porc;
    document.getElementById("precioFinal").value = p.venta;
    editandoIndex = i;
    document.getElementById("btnGuardar").innerText = "Actualizar Producto";
}

function eliminarProducto(i) {
    if (confirm("¿Eliminar producto?")) {
        let productos = JSON.parse(localStorage.getItem(categoriaActual));
        productos.splice(i, 1);
        localStorage.setItem(categoriaActual, JSON.stringify(productos));
        cargarProductos(); calcularGranTotal();
    }
}

function limpiarFormulario() {
    document.getElementById("producto").value = "";
    document.getElementById("cantidad").value = "";
    document.getElementById("costoBase").value = "";
    document.getElementById("porcentaje").value = 20;
    document.getElementById("precioFinal").value = "";
    editandoIndex = -1;
    document.getElementById("btnGuardar").innerText = "+ Guardar Producto";
}

function resetTotal() { if (confirm("¿Borrar todo el sistema?")) { localStorage.clear(); location.reload(); } }

mostrarLogin();