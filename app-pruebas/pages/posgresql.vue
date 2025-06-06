<template>
    <div>
        <div class="row flex flex-center q-mt-md">
            <div class="text-h4">Pruebas para PostgresSQL <q-img
                    src="https://www.postgresql.org/media/img/about/press/elephant.png"
                    alt="PostgreSQL Logo"
                    style="width: 80px; height: auto; margin-left: 10px;"
                /></div>
            
        </div>
        <div class="row">
            <div class="text-caption col-12 q-ml-md">
                Recuerda que debes tener arrancado el contenedor de POSTGRESSQL levantado con docker y no debe tener datos, solo debe tener la estructura de las tablas.
                Haz clic en iniciar y comenzamos las pruebas, primero insertando, luego actualizando, consultando y eliminando.
                Si vuelves ha hacer pruebas se recomienda que ejecutes docker compose down y luego <strong>docker compose up -d</strong> 
                <p>Recuerda que en el archivo <strong>/postgres/docker-compose.yml</strong> defines la memoria y el CPU asignado al contenedor para las pruebas</p>
            </div>
            <q-input
                v-model="inicioId"
                label="ID inicial"
                type="number"
                outlined
                dense
                class="q-mt-sm"
                style="margin-bottom: 20px;margin-left: 16%;"
            />
            <br/>
            <div class="col-12 row q-ml-md">
                <div class="col-2">
                    <div class="text-bold">Pruebas en Categorias</div>
                    Insercion: <strong>{{ pruebas.categorias.insertar }}</strong><br>
                    Actualizacion: <strong>{{ pruebas.categorias.actualizar }}</strong><br>
                    Consulta: <strong>{{ pruebas.categorias.aleatorio }}</strong><br>
                </div>
                <div class="col-2">
                    <div class="text-bold">Pruebas en Productos</div>
                    Insercion: <strong>{{ pruebas.productos.insertar }}</strong><br>
                    Actualizacion: <strong>{{ pruebas.productos.actualizar }}</strong><br>
                    Consulta: <strong>{{ pruebas.productos.aleatorio }}</strong><br>
                </div>
                <div class="col-2">
                    <div class="text-bold">Pruebas en Ordenes</div>
                    Insercion: <strong>{{ pruebas.ordenes.insertar }}</strong><br>
                    Actualizacion: <strong>{{ pruebas.ordenes.actualizar }}</strong><br>
                    Consulta: <strong>{{ pruebas.ordenes.aleatorio }}</strong><br>
                    Detalle Ordenes: <strong>{{ pruebas.ordenes.detalleoden }}</strong><br>
            
                </div>
                <div class="col-3 q-ml-lg">
                <q-btn size="lg" :loading="cargando" @click="realizarPruebas" color="primary">Iniciar Pruebas</q-btn>
                
                <q-circular-progress
                show-value
                font-size="12px"
                :value="avance"
                size="50px"
                :thickness="0.22"
                color="teal"
                track-color="grey-3"
                class="q-ma-md"
                >
                {{ avance }}%
                </q-circular-progress>
            </div>
            <div class="percentage-counter">
                <div class="logo-container">
                <div class="fill" :style="{ height: fillHeight }"></div>
                <img src="/postgresql.png" alt="PostgreSQL Logo" class="logo" />
                </div>
                <div class="percentage">{{ avance }}%</div>
            </div>

            </div>
        </div>
        
        <div class="row q-ml-lg q-mt-md">
            <q-table
            flat bordered
            title="Pruebas sobre Gestor MySQL"
            :rows="rows"
            :columns="columns"
            color="primary"
            row-key="name"
            class="col-6"
            
            >            
            </q-table>
           
            <div class="col-2 q-ml-md">
                <div class="text-h6">Errores</div>
                <q-input class="q-my-sm" label="Errores Inserción" outlined v-model="erroresInsercion"  dense>
                    <template v-slot:prepend>
                    <q-icon name="warning" />
                    </template>
                </q-input>
                <q-input class="q-my-sm" label="Errores Consulta" outlined v-model="erroresConsulta"  dense>
                    <template v-slot:prepend>
                    <q-icon name="warning" />
                    </template>
                </q-input>
                <q-input class="q-my-sm" label="Errores Actualización" outlined v-model="erroresActualizacion"  dense>
                    <template v-slot:prepend>
                    <q-icon name="warning" />
                    </template>
                </q-input>
                <q-input class="q-my-sm" label="Errores Eliminación" outlined v-model="erroresEliminacion"  dense>
                    <template v-slot:prepend>
                    <q-icon name="warning" />
                    </template>
                </q-input>
            </div>
            <div class="col-2 q-ml-md">                
                <q-scroll-area style="height: 300px;">
                    <div v-for="n in mensajes" :key="n" class="q-py-xs">
                        {{ n }}
                    </div>
                </q-scroll-area>   
            </div>
        </div>
        
    </div>
</template>

<script setup lang="ts">
import { ref, computed} from 'vue'
import { exportFile } from 'quasar'

import pruebas from '../server/utils/pruebas.json'
import { categoriasInsertar, categoriasConsultar, categoriasConsultarAzar, categoriasActualizar, categoriasEliminar } from '../server/utils/postgres/categorias'
import { productosInsertar, productosConsultar, productosConsultarAzar, productosActualizar, productosEliminar } from '../server/utils/postgres/productos'
import { ordenesInsertar, ordenesConsultarAzar, ordenesActualizar, ordenesEliminar } from '../server/utils/postgres/ordenes'
import { resumenesContarOrdenes, resumenesProductos, resumenesProductosFecha, resumenesTotalDiario, resumenesTopten } from '../server/utils/postgres/resumenes'


const tiemposInsercion= ref([])
const tiemposConsulta= ref([ ])
const tiemposActualizacion= ref([ ])
const tiemposResumen= ref([ ])
const tiemposEliminacion= ref([])
const erroresInsercion= ref(0)
const erroresConsulta= ref(0)
const erroresActualizacion= ref(0)
const erroresEliminacion= ref(0)
const cargando= ref(false)
const totalPruebas= ref(19)
const mensajes= ref([])

const inicioId=ref(1)

//propiedad computada del porcentaje de pruebas realizadas
const avance = computed(() => {
    return Math.round((tiemposInsercion.value.length + tiemposConsulta.value.length + tiemposActualizacion.value.length + tiemposEliminacion.value.length + tiemposResumen.value.length) / totalPruebas.value * 100)
})
const fillHeight = computed(() => `${((tiemposInsercion.value.length + tiemposConsulta.value.length + tiemposActualizacion.value.length + tiemposEliminacion.value.length + tiemposResumen.value.length) / totalPruebas.value * 100)}%`);

//propiedades para la tabla
const columns = [
  {
    name: 'name',
    required: true,
    label: 'Prueba (Tiempos en segundos)',
    align: 'left',
    field: row => row.name,
    format: val => `${val}`,
    sortable: true
  },
  { name: 'total', label: 'Total', field: 'total' },
  { name: 'a', align: 'center', label: 'A', field: 'a' },
  { name: 'b', label: 'B', field: 'b' },
  { name: 'c', label: 'C', field: 'c' },
  { name: 'd', label: 'D', field: 'd' },
  { name: 'e', label: 'E', field: 'e' },
  
]


const rows=computed(() => {
    return [
            {
                name: 'Insertar',
                a: tiemposInsercion.value[0]? tiemposInsercion.value[0]: 0,
                b: tiemposInsercion.value[1]? tiemposInsercion.value[1]: 0,
                c: tiemposInsercion.value[2]? tiemposInsercion.value[2]: 0,
                d: tiemposInsercion.value[3]? tiemposInsercion.value[3]: 0,
                e: tiemposInsercion.value[4]? tiemposInsercion.value[4]: 0, 
                total: tiemposInsercion.value.reduce((a, b) => a + b, 0)/1000
            },
                {
                    name: 'Consultar',
                    a: tiemposConsulta.value[0]? tiemposConsulta.value[0]: 0,
                    b: tiemposConsulta.value[1]? tiemposConsulta.value[1]: 0,
                    c: tiemposConsulta.value[2]? tiemposConsulta.value[2]: 0,
                    d: tiemposConsulta.value[3]? tiemposConsulta.value[3]: 0,
                    e: tiemposConsulta.value[4]? tiemposConsulta.value[4]: 0,
                    total: tiemposConsulta.value.reduce((a, b) => a + b, 0)  /1000
                },
                {
                    name: 'Actualizar',
                    a: tiemposActualizacion.value[0]? tiemposActualizacion.value[0]: 0,
                    b: tiemposActualizacion.value[1]? tiemposActualizacion.value[1]: 0,
                    c: tiemposActualizacion.value[2]? tiemposActualizacion.value[2]: 0,
                    d: tiemposActualizacion.value[3]? tiemposActualizacion.value[3]: 0,
                    e: tiemposActualizacion.value[4]? tiemposActualizacion.value[4]: 0,  
                    total: tiemposActualizacion.value.reduce((a, b) => a + b, 0) /1000 
                },
                {
                    name: 'Resumenes',
                    a: tiemposResumen.value[0]? tiemposResumen.value[0]: 0,
                    b: tiemposResumen.value[1]? tiemposResumen.value[1]: 0,
                    c: tiemposResumen.value[2]? tiemposResumen.value[2]: 0,
                    d: tiemposResumen.value[3]? tiemposResumen.value[3]: 0,
                    e: tiemposResumen.value[4]? tiemposResumen.value[4]: 0,
                    total: tiemposResumen.value.reduce((a, b) => a + b, 0)/1000
                },
                {
                    name: 'Eliminar',
                    a: tiemposEliminacion.value[0]? tiemposEliminacion.value[0]: 0,
                    b: tiemposEliminacion.value[1]? tiemposEliminacion.value[1]: 0,
                    c: tiemposEliminacion.value[2]? tiemposEliminacion.value[2]: 0,
                    d: tiemposEliminacion.value[3]? tiemposEliminacion.value[3]: 0,
                    e: tiemposEliminacion.value[4]? tiemposEliminacion.value[4]: 0,
                    total: tiemposEliminacion.value.reduce((a, b) => a + b, 0)/1000
                },
            ]

    
})



async function realizarPruebas() {
    try {
        
    cargando.value=true
    totalPruebas.value=19 // son 19 pruebas a realizar
    let tiempo:number;
    
    //INSERTANDO DATOS
    mensajes.value.push("Iniciando pruebas de inserción")    
    tiempo=await categoriasInsertar(pruebas.categorias.insertar,inicioId.value)
    tiempo==-1? erroresInsercion.value++: tiemposInsercion.value.push(tiempo);   
    
    tiempo=await productosInsertar(pruebas.productos.insertar,inicioId.value)
    tiempo==-1? erroresInsercion.value++: tiemposInsercion.value.push(tiempo);   
    tiempo=await ordenesInsertar(pruebas.ordenes.insertar, pruebas.ordenes.detalleoden,inicioId.value)
    tiempo==-1? erroresInsercion.value++: tiemposInsercion.value.push(tiempo);
    
    mensajes.value.push("Iniciando pruebas de consultas")
    
    //PROCEDEMOS A CONSULTAR LOS DATOS    
    tiempo=await categoriasConsultar()
    tiempo==-1? erroresConsulta.value++: tiemposConsulta.value.push(tiempo);
    
    tiempo=await categoriasConsultarAzar(pruebas.categorias.aleatorio)
    tiempo==-1? erroresConsulta.value++: tiemposConsulta.value.push(tiempo);
    
    tiempo=await productosConsultar()
    tiempo==-1? erroresConsulta.value++: tiemposConsulta.value.push(tiempo);

    tiempo=await productosConsultarAzar(pruebas.productos.aleatorio)
    tiempo==-1? erroresConsulta.value++: tiemposConsulta.value.push(tiempo);

    // CONSULTAMOS ORDENES AL AZAR DEBEMOS TRAER LOS DATOS DE ORDEN Y SUS DETALLES    
    tiempo=await ordenesConsultarAzar(pruebas.ordenes.aleatorio, inicioId.value)
    tiempo==-1? erroresConsulta.value++: tiemposConsulta.value.push(tiempo);

    //ACTUALIZACION DE DATOS
    mensajes.value.push("Iniciando pruebas de actualización")
    
    tiempo=await categoriasActualizar(pruebas.categorias.actualizar)
    tiempo==-1? erroresActualizacion.value++: tiemposActualizacion.value.push(tiempo);
    
    tiempo=await productosActualizar(pruebas.productos.actualizar)
    tiempo==-1? erroresActualizacion.value++: tiemposActualizacion.value.push(tiempo);
    tiempo=await ordenesActualizar(pruebas.ordenes.actualizar)
    tiempo==-1? erroresActualizacion.value++: tiemposActualizacion.value.push(tiempo);
    
    //Consultas de Resumentes o Totales -Avanzadas
    mensajes.value.push("Iniciando pruebas de resumenes")
    tiempo=await resumenesContarOrdenes()
    tiempo==-1? erroresConsulta.value++: tiemposResumen.value.push(tiempo);
    tiempo=await resumenesProductos()
    tiempo==-1? erroresConsulta.value++: tiemposResumen.value.push(tiempo);
    tiempo=await resumenesProductosFecha()
    tiempo==-1? erroresConsulta.value++: tiemposResumen.value.push(tiempo);
    tiempo=await resumenesTotalDiario()
    tiempo==-1? erroresConsulta.value++: tiemposResumen.value.push(tiempo);
    tiempo=await resumenesTopten()
    tiempo==-1? erroresConsulta.value++: tiemposResumen.value.push(tiempo);

    //Eliminacion de datos
    mensajes.value.push("Iniciando pruebas de eliminación")
    tiempo=await ordenesEliminar(pruebas.ordenes.insertar, inicioId)
    tiempo==-1? erroresEliminacion.value++: tiemposEliminacion.value.push(tiempo);
    tiempo=await productosEliminar(pruebas.productos.insertar)
    tiempo==-1? erroresEliminacion.value++: tiemposEliminacion.value.push(tiempo);
    
    tiempo=await categoriasEliminar(pruebas.categorias.insertar)
    tiempo==-1? erroresEliminacion.value++: tiemposEliminacion.value.push(tiempo);

    console.log("Terminaron las pruebas realizadas")
    mensajes.value.push("Terminaron las pruebas realizadas")
    cargando.value=false
    
} catch (error) {
        console.error(error)
    }    
}

</script>
<style scoped>
.percentage-counter {
  position: relative;
  width: 190px;
  height: 190px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.logo {
  position: relative; /* Asegura que la imagen esté por encima del fill */
  width: 100%;
  height: 105%;
  object-fit: contain;
  z-index: 2; /* Coloca la imagen por encima del fill */
}

.fill {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #34638d; /* Color de llenado */
  transition: height 0.5s ease;
  z-index: 1; /* Coloca el fill detrás de la imagen */
}

.percentage {
  position: absolute;
  font-size: 24px;
  font-weight: bold;
  color: #000;
  z-index: 3; /* Asegura que el porcentaje esté por encima de todo */
}
</style>