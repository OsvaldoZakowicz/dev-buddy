<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <!-- font -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap" rel="stylesheet">
  <!-- styles -->
  <link rel="stylesheet" href="./assets/css/styles.css">
  <title>DevBuddy</title>
</head>

<body>
  <main class="container">
    <!-- titulo -->
    <section class="title-content">
      <h1 class="title">DevBuddy</h1>
      <span class="subtitle">Tu compañero de programaci&oacute;n!</span>
    </section>
    <!-- contenido de chat, salida del prompt -->
    <section class="chat-output"></section>
    <!-- entrada de prompt -->
    <form class="chat-form">
      <textarea class="chat-input" placeholder="¿C&oacute;mo puedo ayudarte hoy?" rows="2">
      </textarea>
      <div class="chat-controls">
        <button class="btn btn-send">
          enviar
          <img src="./assets/icons/send.svg" alt="" width="16px" height="16px">
        </button>
      </div>
    </form>
  </main>

  <!-- scripts -->
  <script src="./assets/js/app.js"></script>
</body>

</html>
