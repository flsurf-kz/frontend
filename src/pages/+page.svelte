<script lang="ts">
	// Локальные данные для секций
	let howItWorksSteps = [
	  { id: 1, title: "Создайте заказ", description: "Опишите задачи и бюджет" },
	  { id: 2, title: "Получите предложения", description: "Фрилансеры откликаются на ваш заказ" },
	  { id: 3, title: "Выберите исполнителя", description: "Оцените предложения и выберите лучшее" }
	];
  
	let categories = [
	  { id: 1, title: "Программирование", description: "Веб-разработка, мобильные приложения и др." },
	  { id: 2, title: "Дизайн", description: "Графика, UI/UX, иллюстрации" },
	  { id: 3, title: "Копирайтинг", description: "Контент, статьи, переводы" }
	];
  
	let faqItems = [
	  { question: "Как работает платформа?", answer: "Вы создаёте заказ, фрилансеры отправляют предложения, а вы выбираете лучшее." },
	  { question: "Как проходит оплата?", answer: "Оплата осуществляется через защищённую сделку с отзывами." },
	  { question: "Как повысить рейтинг?", answer: "Качественное выполнение заказов и положительные отзывы помогут вам расти." }
	];
  </script>
  
<style>
	/* Дополнительные стили можно добавить здесь, если нужно */
	section {
		padding-top: 4rem;
		padding-bottom: 4rem;
	}
</style>
  
<main class="space-y-16">
<!-- Hero Section -->
<section class="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
  <div class="container mx-auto px-4 text-center">
	<h1 class="text-4xl sm:text-6xl font-extrabold mb-4">
	  Лучшие заказы для профессионалов
	</h1>
	<p class="text-xl sm:text-2xl mb-8">
	  Найдите работу, соответствующую вашим навыкам, или найдите идеального исполнителя для своего проекта.
	</p>
	<div class="flex justify-center space-x-4">
	  <button class="btn btn-primary">Найти заказы</button>
	  <button class="btn btn-outline btn-light">Разместить заказ</button>
	</div>
  </div>
</section>

<!-- How It Works Section -->
<section class="bg-white">
  <div class="container mx-auto px-4">
	<h2 class="text-3xl font-bold text-center mb-8">Как это работает?</h2>
	<div class="grid grid-cols-1 sm:grid-cols-3 gap-8">
	  {#each howItWorksSteps as step}
		<div class="p-6 border rounded-lg shadow hover:shadow-xl transition">
		  <div class="text-2xl font-bold text-indigo-600 mb-2">Шаг {step.id}</div>
		  <h3 class="text-xl font-semibold mb-2">{step.title}</h3>
		  <p class="text-gray-600">{step.description}</p>
		</div>
	  {/each}
	</div>
  </div>
</section>

<!-- Categories Section -->
<section class="bg-gray-50">
  <div class="container mx-auto px-4">
	<h2 class="text-3xl font-bold text-center mb-8">Категории заказов</h2>
	<div class="flex flex-wrap justify-center gap-6">
	  {#each categories as cat}
		<div class="bg-white p-6 rounded-lg shadow w-full sm:w-64 hover:shadow-xl transition">
		  <h3 class="text-xl font-semibold mb-2 text-gray-800">{cat.title}</h3>
		  <p class="text-gray-600">{cat.description}</p>
		</div>
	  {/each}
	</div>
  </div>
</section>

<!-- FAQ Section -->
<section class="bg-white">
  <div class="container mx-auto px-4">
	<h2 class="text-3xl font-bold text-center mb-8">Часто задаваемые вопросы</h2>
	<div class="space-y-4 max-w-2xl mx-auto">
	  {#each faqItems as faq}
		<div class="p-4 border rounded hover:shadow transition">
		  <h3 class="font-semibold text-lg mb-2">{faq.question}</h3>
		  <p class="text-gray-700">{faq.answer}</p>
		</div>
	  {/each}
	</div>
  </div>
</section>

<!-- Promo Section -->
<section class="bg-gradient-to-r from-green-500 to-teal-500 text-white">
  <div class="container mx-auto px-4 flex flex-col md:flex-row items-center gap-8">
	<div class="flex-1">
	  <h2 class="text-3xl font-bold mb-4">
		Работайте эффективно с нами
	  </h2>
	  <p class="text-xl mb-6">
		Присоединяйтесь к тысячам профессионалов и находите заказы, которые помогут вашему бизнесу расти.
	  </p>
	  <button class="btn btn-light">Начать сейчас</button>
	</div>
	<div class="flex-1">
	  <img src="https://via.placeholder.com/600x400" alt="Промо изображение" class="w-full md:w-1/2 rounded shadow-md" />
	</div>
  </div>
</section>
</main>
  