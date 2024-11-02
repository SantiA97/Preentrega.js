$(document).ready(function() {
    let carroCompras = JSON.parse(localStorage.getItem('carroCompras')) || [];
    let productos = [];

    const cargarProductos = async () => {
        try {
            const response = await fetch('productos.json');
            productos = await response.json();
            actualizarDOMListaProductos();
        } catch (error) {
            console.error("Error al cargar los productos:", error);
        }
    };

    const actualizarDOMListaProductos = () => {
        $('#lista-productos').empty();
        _.forEach(productos, producto => {
            $('#lista-productos').append(`
                <li>
                    ${producto.id} - ${producto.nombre}: $${producto.precio} 
                    <button class="ver-detalle" data-id="${producto.id}">Ver Detalle</button>
                </li>
            `);
        });
    };

    const mostrarDetalleProducto = (id) => {
        const producto = _.find(productos, { id: parseInt(id) });
        if (producto) {
            const detalleHTML = `
                <h3>${producto.nombre}</h3>
                <p><strong>Descripción:</strong> ${producto.descripcion}</p>
                <p><strong>Precio:</strong> $${producto.precio}</p>
                <p><strong>Tipo:</strong> ${producto.tipo}</p>
                <p><strong>Tamaño:</strong> ${producto.tamaño}</p>
            `;
            $('#detalle-producto').html(detalleHTML).show();
        }
    };

    const actualizarDOMCarroCompras = () => {
        $('#carro-compras').empty();
        _.forEach(carroCompras, producto => {
            $('#carro-compras').append(`<li>${producto.nombre} | Cantidad: ${producto.cantidad}</li>`);
        });
    };

    const agregarAlCarro = (producto, cantidad) => {
        const productoEnCarro = _.find(carroCompras, { id: producto.id });
        if (productoEnCarro) {
            productoEnCarro.cantidad += cantidad;
        } else {
            carroCompras.push({ ...producto, cantidad });
        }
        localStorage.setItem('carroCompras', JSON.stringify(carroCompras));
        actualizarDOMCarroCompras();
    };

    const compraEnCuotas = (precioTotal, cuotas) => (precioTotal / cuotas).toFixed(2);

    const finalizarCompra = () => {
        const totalProductos = _.sumBy(carroCompras, 'cantidad');
        const totalPrecio = _.sumBy(carroCompras, producto => producto.precio * producto.cantidad);
        const usarDescuento = $('#usar-descuento').is(':checked');
        let totalConDescuento = usarDescuento ? totalPrecio * 0.85 : totalPrecio;

        const cuotasSeleccionadas = parseInt($('#cuotas').val());
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
        $('#resumen-compra').html(resumenCompra);

        carroCompras = [];
        localStorage.removeItem('carroCompras');
        actualizarDOMCarroCompras();
    };

    $('#agregar-producto').on('click', () => {
        const nombreProducto = $('#nombre-producto').val();
        const cantidadProducto = parseInt($('#cantidad-producto').val());

        const producto = _.find(productos, item => item.nombre.toLowerCase() === nombreProducto.toLowerCase());
        if (producto && cantidadProducto > 0) {
            agregarAlCarro(producto, cantidadProducto);
            $('#nombre-producto').val(''); // Limpiar campo
            $('#cantidad-producto').val(''); // Limpiar campo
        } else {
            $('#resumen-compra').html("<p>Producto no encontrado o cantidad inválida.</p>");
        }
    });

    $('#ver-promocion').on('click', () => {
        const listaPrecios = _.map(productos, producto => {
            return `<p>${producto.nombre}: Con descuento $${(producto.precio * 0.85).toFixed(2)}</p>`;
        }).join('');
        $('#resumen-compra').html(listaPrecios);
    });

    $('#confirmar-compra').on('click', finalizarCompra);

    // Manejo de eventos para ver detalles del producto
    $(document).on('click', '.ver-detalle', function() {
        const productoId = $(this).data('id');
        mostrarDetalleProducto(productoId);
    });

    // Llama a cargar productos al inicio
    cargarProductos();
});
