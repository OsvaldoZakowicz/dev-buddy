<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <!-- font -->
  <!-- <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap" rel="stylesheet"> -->
  <!-- styles -->
  <link rel="stylesheet" href="./assets/css/styles.css">
  <title>DevBuddy</title>
</head>

<body>
  <main class="container">
    <section class="title-content">
      <h1>devbuddy</h1>
      <span>tu compañero de programaci&oacute;n!</span>
      <p>modelo: qwen2.5-coder:3b</p>
    </section>
    <section class="chat-content">
      <!-- output -->
      <section class="chat-output"></section>
      <!-- input -->
      <form>
        <textarea
          class="chat-input"
          placeholder="escribe tu pregunta... (enter para enviar, shift+enter para nueva línea)"
          rows="3"></textarea>
      </form>
    </section>
  </main>

  <!-- scripts -->
  <script src="./assets/js/app.js"></script>
</body>

</html>
