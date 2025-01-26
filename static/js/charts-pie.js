/**
 * For usage, visit Chart.js docs https://www.chartjs.org/docs/latest/
 */
const pieConfig = {
  type: 'doughnut',
  data: {
    datasets: [
      {
        data: [33, 33, 33],
        /**
         * These colors come from Tailwind CSS palette
         * https://tailwindcss.com/docs/customizing-colors/#default-color-palette
         */
        backgroundColor: ['#0694a2', '#1c64f2', '#7e3af2'],
        label: 'Dataset 1',
      },
    ],
    labels: ['Shoes', 'Shirts', 'Bags'],
  },
  options: {
    responsive: true,
    cutoutPercentage: 80,
    /**
     * Default legends are ugly and impossible to style.
     * See examples in charts.html to add your own legends
     *  */
    legend: {
      display: false,
    },
  },
}

// change this to the id of your chart element in HMTL
const pieCtx = document.getElementById('pie')
window.myPie = new Chart(pieCtx, pieConfig)

// countCommentsByHour = (data) => {
//   const labels = ["0 a.m. - 8 a.m.", "8 a.m. - 16 p.m.", "16 p.m. - 0 a.m."];
//   const counts = [0, 0, 0];

//   Object.values(data).forEach((record) => {
//     const savedTime = record.saved;

//     if (!savedTime) {
//       console.warn("Registro sin fecha guardada:", record);
//       return;
//     }

//     try {
//       // Reemplazar caracteres no estándar
//       const formattedTime = savedTime.replace(/\xa0/g, " ");
      
//       // Extraer fecha y hora usando expresión regular
//       const match = formattedTime.match(
//         /(\d{2})\/(\d{2})\/(\d{4}), (\d{1,2}):(\d{2}):(\d{2}) (a\. m\.|p\. m\.)/i
//       );

//       if (!match) {
//         console.warn("Fecha inválida:", savedTime);
//         return;
//       }

//       const [, day, month, year, hour, minute, second, period] = match;

//       // Convertir a formato 24 horas si es necesario
//       let adjustedHour = parseInt(hour, 10);
//       if (period.toLowerCase() === "p. m." && adjustedHour !== 12) {
//         adjustedHour += 12;
//       } else if (period.toLowerCase() === "a. m." && adjustedHour === 12) {
//         adjustedHour = 0;
//       }

//       // Crear el objeto Date
//       const dt = new Date(
//         parseInt(year, 10),
//         parseInt(month, 10) - 1,
//         parseInt(day, 10),
//         adjustedHour,
//         parseInt(minute, 10),
//         parseInt(second, 10)
//       );

//       if (isNaN(dt)) {
//         console.warn("Fecha inválida después de ajustar:", savedTime);
//         return;
//       }

//       const hourOfDay = dt.getHours();

//       // Clasificar en el rango correspondiente
//       if (hourOfDay >= 0 && hourOfDay < 8) {
//         counts[0]++;
//       } else if (hourOfDay >= 8 && hourOfDay < 16) {
//         counts[1]++;
//       } else {
//         counts[2]++;
//       }
//     } catch (error) {
//       console.error("Error procesando la fecha:", savedTime, error);
//     }
//   });

//   return { labels, counts };
// };

// update = () => {
//   fetch("/api/v1/landing")
//     .then((response) => response.json())
//     .then((data) => {
//       console.log("Datos recibidos:", data);
//       const { labels, counts } = countCommentsByHour(data);

//       // Actualizar el gráfico
//       window.myPie.data.labels = labels;
//       window.myPie.data.datasets[0].data = counts;
//       window.myPie.update();
//     })
//     .catch((error) => console.error("Error al actualizar el gráfico:", error));
// };

// update();
// Función para normalizar el texto
const normalizeString = (str) =>
  str
    .trim() // Elimina espacios adicionales al inicio y al final
    .replace(/\u00A0/g, " ") // Reemplaza espacios no rompibles con espacios regulares
    .normalize("NFKC"); // Normaliza caracteres Unicode

const countCommentsByHour = (data) => {
  const labels = ["0 a.m. - 8 a.m.", "8 a.m. - 16 p.m.", "16 p.m. - 0 a.m."];
  const counts = [0, 0, 0];

  Object.values(data).forEach((record) => {
    const savedTime = record.saved;

    if (!savedTime) {
      console.warn("Registro sin fecha guardada:", record);
      return;
    }

    try {
      // Normalizar la fecha usando la función normalizeString
      const normalizedTime = normalizeString(savedTime);

      // Validar el formato esperado con una expresión regular
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

      // Extraer componentes de la fecha
      const [, day, month, year, hour, minute, second, period] = match;

      // Convertir a formato 24 horas
      let adjustedHour = parseInt(hour, 10);
      if (period.toLowerCase() === "p. m." && adjustedHour !== 12) {
        adjustedHour += 12;
      } else if (period.toLowerCase() === "a. m." && adjustedHour === 12) {
        adjustedHour = 0;
      }

      // Crear el objeto Date
      const dt = new Date(
        parseInt(year, 10),
        parseInt(month, 10) - 1,
        parseInt(day, 10),
        adjustedHour,
        parseInt(minute, 10),
        parseInt(second, 10)
      );

      if (isNaN(dt)) {
        console.warn("Fecha inválida después de ajustar:", normalizedTime, {
          adjustedHour,
          minute,
          second,
        });
        return;
      }

      const hourOfDay = dt.getHours();

      // Clasificar en el rango correspondiente
      if (hourOfDay >= 0 && hourOfDay < 8) {
        counts[0]++;
      } else if (hourOfDay >= 8 && hourOfDay < 16) {
        counts[1]++;
      } else {
        counts[2]++;
      }
    } catch (error) {
      console.error("Error procesando la fecha:", savedTime, error);
    }
  });

  return { labels, counts };
};

const update = () => {
  fetch("/api/v1/landing")
    .then((response) => response.json())
    .then((data) => {
      console.log("Datos recibidos:", data);
      const { labels, counts } = countCommentsByHour(data);

      // Actualizar el gráfico
      window.myPie.data.labels = labels;
      window.myPie.data.datasets[0].data = counts;
      window.myPie.update();
    })
    .catch((error) => console.error("Error al actualizar el gráfico:", error));
};

update();