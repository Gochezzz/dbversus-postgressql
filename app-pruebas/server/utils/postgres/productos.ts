import pruebas from '../pruebas.json'

async function productosInsertar(total: number,inicioId:number): Promise<number>  { 
    console.log("Iniciando insercion de productos "+(Number(inicioId)+1))  
    let start = new Date().getTime();    
    for (let i = 1; i <= total; i++) {
        const ldata = {
            id: Number(inicioId) + i,
            nombre: "Producto " + (Number(inicioId) + i),
            precio: Math.floor(Math.random() * 100) + 1,
            idcategoria: Math.floor(Math.random() * pruebas.categorias.insertar) + 1,
        }
        console.log(`Insertando producto con id: ${ldata.id}`)
        console.log('Datos del producto:', JSON.stringify(ldata, null, 2));

        //agrego usando $fetch        
        await $fetch('http://localhost:3000/api/postgres/producto', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(ldata),            
            onRequestError({ request, options, error }) {
                return -1;
            },
        })        
    }
    let end = new Date().getTime();
    let time = end - start;
   return time;
    
}

async function productosConsultar(): Promise<number>  {    
    let start = new Date().getTime();
    await $fetch('http://localhost:3000/api/postgres/productos', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        onRequestError({ request, options, error }) {
            return -1
        },
    })
    let end = new Date().getTime();
    let time = end - start;
    return time;       
}

async function productosConsultarAzar(total:number): Promise<number>  {    
    let start = new Date().getTime();
    for (let i = 1; i <= total; i++) {
        let id = Math.floor(Math.random() * pruebas.productos.insertar) + 1;
        await $fetch('http://localhost:3000/api/postgres/producto/' + id, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            onRequestError({ request, options, error }) {
                return -1;
            },
        })        
    }
    let end = new Date().getTime();
    let time = end - start;
    return time; 
}

async function productosActualizar(total:number): Promise<number>  {
    let start = new Date().getTime();
    for (let i = 1; i <= total; i++) {
        const ldata = {
            id: i,
            nombre: "Producto " + i + " Actualizado",
            precio: Math.floor(Math.random() * 100) + 1,
            categoria: Math.floor(Math.random() * pruebas.categorias.insertar) + 1,
        }

        await $fetch('http://localhost:3000/api/postgres/producto/'+i, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(ldata),
            onRequestError({ request, options, error }) {
                return -1;
            },
        })        
    }
    let end = new Date().getTime();
    let time = end - start;
    return time;
}

async function productosEliminar(total:number): Promise<number>  {
    let start = new Date().getTime();
    for (let i = 1; i <= total; i++) {
        await $fetch('http://localhost:3000/api/postgres/producto/'+i, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: i }),
        onRequestError({ request, options, error }) {
            return -1;
        }
        })  
    }
    let end = new Date().getTime();
    let time = end - start;
    return time; 
}

export { productosInsertar, productosConsultar, productosConsultarAzar, productosActualizar, productosEliminar }