<script lang="ts">
    let faqs = [
      { question: "Как зарегистрироваться на платформе?", answer: "Нажмите кнопку регистрации на главной странице и заполните форму." },
      { question: "Какие заказы доступны?", answer: "Платформа предлагает заказы в различных сферах: программирование, дизайн, копирайтинг и др." },
      { question: "Как оплачиваются проекты?", answer: "Оплата происходит через защищённую сделку с гарантиями выплат." }
    ];
  </script>
  
  <section class="py-16 bg-base-100 text-base-content">
    <div class="container mx-auto px-4 max-w-3xl">
      <h1 class="text-4xl font-bold text-center mb-8">Вопросы и ответы</h1>
      <div class="space-y-6">
        {#each faqs as faq}
          <div class="border-b border-base-300 pb-4">
            <h2 class="text-2xl font-semibold">{faq.question}</h2>
            <p class="mt-2">{faq.answer}</p>
          </div>
        {/each}
      </div>
    </div>
  </section>
  