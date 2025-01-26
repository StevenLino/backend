/**
 * For usage, visit Chart.js docs https://www.chartjs.org/docs/latest/
 */
const lineConfig = {
  type: "line",
  data: {
    labels: [], // Se llenará dinámicamente
    datasets: [
      {
        label: "Registros por día",
        backgroundColor: "#0694a2",
        borderColor: "#0694a2",
        data: [], // Se llenará dinámicamente
        fill: false,
      },
    ],
  },
  options: {
    responsive: true,
    legend: {
      display: false,
    },
    tooltips: {
      mode: "index",
      intersect: false,
    },
    hover: {
      mode: "nearest",
      intersect: true,
    },
    scales: {
      x: {
        display: true,
        scaleLabel: {
          display: true,
          labelString: "Fecha",
        },
      },
      y: {
        display: true,
        scaleLabel: {
          display: true,
          labelString: "Cantidad de registros",
        },
      },
    },
  },
};

// change this to the id of your chart element in HMTL
const lineCtx = document.getElementById('line')
window.myLine = new Chart(lineCtx, lineConfig)


// Función para normalizar el texto (reutilizamos la de antes)
const normalizeString2 = (str) =>
  str
    .trim()
    .replace(/\u00A0/g, " ")
    .normalize("NFKC");

// Función para contar registros por día
const countRecordsByDay = (data) => {
  const countsByDay = {};

  Object.values(data).forEach((record) => {
    const savedTime = record.saved;

    if (!savedTime) {
      console.warn("Registro sin fecha guardada:", record);
      return;
    }

    try {
      // Normalizar la fecha
      const normalizedTime = normalizeString2(savedTime);

      // Extraer solo la fecha (sin la hora)
      const match = normalizedTime.match(
        /(\d{1,2})\/(\d{1,2})\/(\d{4}), (\d{1,2}):(\d{2}):(\d{2}) (a\. m\.|p\. m\.)/i
      );

      if (!match) {
        console.warn("Fecha no coincide con el formato esperado:", {
          original: savedTime,
          normalized: normalizedTime,
        });
        return;
      }

      const [, day, month, year] = match;

      // Formatear la fecha como YYYY-MM-DD para agrupar
      const formattedDate = `${year}-${String(month).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;

      // Incrementar el conteo para la fecha
      countsByDay[formattedDate] = (countsByDay[formattedDate] || 0) + 1;
    } catch (error) {
      console.error("Error procesando la fecha:", savedTime, error);
    }
  });

  return countsByDay;
};

// Actualizar el gráfico de línea
const updateLineChart = () => {
  fetch("/api/v1/landing")
    .then((response) => response.json())
    .then((data) => {
      console.log("Datos recibidos:", data);
      const countsByDay = countRecordsByDay(data);

      // Ordenar las fechas
      const sortedDates = Object.keys(countsByDay).sort(
        (a, b) => new Date(a) - new Date(b)
      );

      // Extraer etiquetas (fechas) y valores (conteos)
      const labels = sortedDates;
      const values = sortedDates.map((date) => countsByDay[date]);

      // Actualizar los datos del gráfico
      window.myLine.data.labels = labels;
      window.myLine.data.datasets[0].data = values;

      // Actualizar el gráfico
      window.myLine.update();
    })
    .catch((error) =>
      console.error("Error al actualizar el gráfico de líneas:", error)
    );
};

// Llamar a la función para actualizar el gráfico
updateLineChart();