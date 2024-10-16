let carroCompras = JSON.parse(localStorage.getItem('carroCompras')) || [];


const actualizarDOMListaProductos = () => {
    const listaProductosElement = document.getElementById('lista-productos');
    listaProductosElement.innerHTML = '';
    productos.forEach(producto => {
        const li = document.createElement('li');
        li.textContent = `${producto.id} - ${producto.nombre}: $${producto.precio}`;
        listaProductosElement.appendChild(li);
    });
};


const actualizarDOMCarroCompras = () => {
    const carroComprasElement = document.getElementById('carro-compras');
    carroComprasElement.innerHTML = '';
    carroCompras.forEach(producto => {
        const li = document.createElement('li');
        li.textContent = `${producto.nombre} | Cantidad: ${producto.cantidad}`;
        carroComprasElement.appendChild(li);
    });
};


const agregarAlCarro = (producto, cantidad) => {
    const productoEnCarro = carroCompras.find(item => item.id === producto.id);
    if (productoEnCarro) {
        productoEnCarro.cantidad += cantidad;
    } else {
        carroCompras.push({ ...producto, cantidad });
    }
    localStorage.setItem('carroCompras', JSON.stringify(carroCompras));
    actualizarDOMCarroCompras();
};

// cuotas
const compraEnCuotas = (precioTotal, cuotas) => {
    return (precioTotal / cuotas).toFixed(2);
};


const finalizarCompra = () => {
    const totalProductos = carroCompras.reduce((acc, producto) => acc + producto.cantidad, 0);
    const totalPrecio = carroCompras.reduce((acc, producto) => acc + (producto.precio * producto.cantidad), 0);

    const usarDescuento = document.getElementById('usar-descuento').checked;
    let totalConDescuento = usarDescuento ? totalPrecio * 0.85 : totalPrecio;

    const cuotasSeleccionadas = parseInt(document.getElementById('cuotas').value);
    let detalleCuotas = '';
    if (cuotasSeleccionadas > 1) {
        const totalCuota = compraEnCuotas(totalConDescuento, cuotasSeleccionadas);
        detalleCuotas = `Total en ${cuotasSeleccionadas} cuotas de $${totalCuota}`;
    } else {
        detalleCuotas = "Pago en una sola cuota.";
    }

    const resumenCompra = `
        <p>Total de productos: ${totalProductos}</p>
        <p>Total: $${totalConDescuento.toFixed(2)}</p>
        <p>${detalleCuotas}</p>
        <p>¡Gracias por su compra!</p>
    `;
    document.getElementById('resumen-compra').innerHTML = resumenCompra;

    carroCompras = [];
    localStorage.removeItem('carroCompras');
    actualizarDOMCarroCompras();
};

// productos agregados
document.getElementById('agregar-producto').addEventListener('click', () => {
    const nombreProducto = document.getElementById('nombre-producto').value;
    const cantidadProducto = parseInt(document.getElementById('cantidad-producto').value);

    const producto = productos.find(item => item.nombre.toLowerCase() === nombreProducto.toLowerCase());
    if (producto && cantidadProducto > 0) {
        agregarAlCarro(producto, cantidadProducto);
    } else {
        document.getElementById('resumen-compra').innerHTML = "<p>Producto no encontrado o cantidad inválida.</p>";
    }
});

// Lista precio normales y descuento
document.getElementById('ver-promocion').addEventListener('click', () => {
    const listaPrecios = productos.map(producto => {
        return `<p>${producto.nombre}: Con descuento $${(producto.precio * 0.85).toFixed(2)}</p>`;
    }).join('');
    document.getElementById('resumen-compra').innerHTML = listaPrecios;
});

// finalizar compra
document.getElementById('confirmar-compra').addEventListener('click', finalizarCompra);


actualizarDOMListaProductos();
actualizarDOMCarroCompras();
