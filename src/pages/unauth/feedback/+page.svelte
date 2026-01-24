<script lang="ts">
  let name = '';
  let email = '';
  let subject = '';
  let message = '';
  let formSubmitted = false;
  let formError = '';

  function handleSubmit() {
    formError = '';
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      formError = 'Пожалуйста, заполните все обязательные поля.';
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      formError = 'Пожалуйста, введите корректный адрес электронной почты.';
      return;
    }

    formSubmitted = true;
    console.log('--- Демонстрационная Отправка Формы Обратной Связи FLSURF.KZ ---');
    console.log('Имя:', name);
    console.log('Email:', email);
    console.log('Тема:', subject);
    console.log('Сообщение:', message);
    console.log('Предполагается, что эти данные были бы отправлены на support@flsurf.kz');
  }
</script>

<div class="container mx-auto px-4 py-10 max-w-2xl">
  <h1 class="text-3xl font-bold mb-6 text-center text-base-content">Обратная связь с FLSURF.KZ</h1>

  {#if formSubmitted}
    <div class="p-6 mb-4 text-lg text-center text-success-content bg-success/20 rounded-lg border border-success" role="alert">
      <h2 class="font-semibold text-2xl mb-2">Спасибо за ваш отзыв!</h2>
      <p>Мы (гипотетически) получили ваше сообщение для FLSURF.KZ.</p>
      <p class="text-sm mt-2">(Это демонстрационная форма, и ваши данные <strong class="font-semibold">не были отправлены</strong> на сервер. Они были выведены в консоль вашего браузера.)</p>
      <p class="text-sm mt-1">В реальной системе ваше обращение было бы направлено в службу поддержки FLSURF.KZ по адресу: <code class="font-mono bg-base-300 px-1 rounded">support@flsurf.kz</code>.</p>
      <button class="btn btn-outline btn-success mt-4" on:click={() => { formSubmitted = false; name=''; email=''; subject=''; message='';}}>Отправить еще одно сообщение</button>
    </div>
  {:else}
    <p class="mb-8 text-center text-base-content/80 leading-relaxed">
      Команда FLSURF.KZ всегда стремится улучшить нашу платформу и сервис. Если у вас есть вопросы по работе FLSURF.KZ, предложения, вы заметили ошибку или хотите поделиться своим опытом, пожалуйста, заполните форму ниже.
      <br/>
      <strong class="font-semibold">Важно:</strong> это демонстрационная форма. Введенные данные не будут сохранены или отправлены.
    </p>

    <form on:submit|preventDefault={handleSubmit} class="space-y-6 bg-base-100 p-6 sm:p-8 shadow-xl rounded-lg border border-base-300/50">
      <div>
        <label for="name" class="block text-sm font-medium text-base-content mb-1">Ваше имя<span class="text-error">*</span></label>
        <input type="text" id="name" bind:value={name} class="input input-bordered w-full placeholder-base-content/40" placeholder="Например, Айдос Ермеков" required />
      </div>

      <div>
        <label for="email" class="block text-sm font-medium text-base-content mb-1">Ваш Email<span class="text-error">*</span></label>
        <input type="email" id="email" bind:value={email} class="input input-bordered w-full placeholder-base-content/40" placeholder="aidos.ermekov@example.kz" required />
      </div>

      <div>
        <label for="subject" class="block text-sm font-medium text-base-content mb-1">Тема сообщения<span class="text-error">*</span></label>
        <input type="text" id="subject" bind:value={subject} class="input input-bordered w-full placeholder-base-content/40" placeholder="Предложение по улучшению FLSURF.KZ" required />
      </div>

      <div>
        <label for="message" class="block text-sm font-medium text-base-content mb-1">Ваше сообщение<span class="text-error">*</span></label>
        <textarea id="message" bind:value={message} rows="6" class="textarea textarea-bordered w-full placeholder-base-content/40" placeholder="Подробно опишите ваш вопрос или идею для FLSURF.KZ..." required></textarea>
      </div>

      {#if formError}
        <div role="alert" class="alert alert-error text-sm py-2 px-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{formError}</span>
        </div>
      {/if}

      <div class="text-xs text-base-content/60">
        Нажимая "Отправить (Демо)", вы подтверждаете, что это демонстрационная форма и данные не будут отправлены. В реальной системе FLSURF.KZ они были бы направлены по адресу <code class="font-mono bg-base-300 px-1 rounded">support@flsurf.kz</code> или аналогичному.
      </div>

      <div>
        <button type="submit" class="btn btn-primary w-full">
          Отправить (Демо)
        </button>
      </div>
    </form>
  {/if}
</div>