<!-- routes/+page.svelte -->

<script>
	import Card from '$lib/ui/Card.svelte';
	import Visualizer from '$lib/widgets/Visualizer.svelte';
	import Clock from '$lib/widgets/Clock.svelte';
  	import Todo from '../lib/widgets/Todo.svelte';
  import Motd from '../lib/widgets/Motd.svelte';
</script>

<div class="home-wrapper">
	<Card title="Visualizer" gridArea="vis">
		<Visualizer />
	</Card>
	<Card title ="Clock" gridArea="clk">
		<Clock />
	</Card>
	<Card title ="Clock" gridArea="c">
		<Clock />
	</Card>
	<Card title ="Todo" gridArea="tdo">
		<Todo />
	</Card>
	<Card title ="MotD" gridArea="mtd">
		<Motd />
	</Card>
</div>

<style>
	.home-wrapper {
		width: 90rem;
		max-width: 100%;
	}

	:global(.home-wrapper) {
		display: grid;
		grid-gap: 1rem;
		grid-template-areas:
			"mtd mtd clk clk clk "
			"mtd mtd tdo tdo tdo "
			"vis vis tdo tdo tdo "
			" c   c  tdo tdo tdo " ;
	}
</style>
