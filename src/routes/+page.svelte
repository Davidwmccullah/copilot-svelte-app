<svelte:head>
    <title>Dashboard</title> 
</svelte:head>

<script>
	import Card from '$lib/ui/Card.svelte';
	import Visualizer from '$lib/widgets/Visualizer.svelte';
	import Clock from '$lib/widgets/Clock.svelte';
  	import Todo from '../lib/widgets/Todo.svelte';
  	import Motd from '../lib/widgets/Motd.svelte';
</script>

<div class="home-wrapper">
	<Card title ="Clock" style="grid-area: clk">
		<Clock />
	</Card>
	<Card title ="Message of the Day" style="grid-area: mtd">
		<Motd />
	</Card>
	<Card title="Visualizer" style="grid-area: vis">
		<Visualizer />
	</Card>
	<Card title ="To Do" style="grid-area: tdo">
		<Todo />
	</Card>
</div>

<style>
	.home-wrapper {
		width: 90rem;
		max-width: 100%;
		min-width: 20rem;
	}

	:global(.home-wrapper) {
		display: grid;
		grid-gap: 1rem;
		grid-template-areas:
			"mtd mtd mtd mtd clk "
			"vis vis vis tdo tdo "
			"vis vis vis tdo tdo "
			"vis vis vis tdo tdo " ;
			/* "vis"; */
	}

	@media (max-width: 60rem) {
		.home-wrapper {
			display: flex;
			flex-direction: column;
		}
	}
</style>
