<script>
  import Hexagon from "../shapes/Hexagon.svelte";

    let todos = [];
    let newTodo = '';

    function addTodo() {
        if (newTodo.trim() !== '') {
            todos = [...todos, newTodo];
            newTodo = '';
        }
    }

    function removeTodo(index) {
        todos = todos.filter((_, i) => i !== index);
    }
</script>

<div class="todo-wrapper">
    <Hexagon>
        <input type="text" class="todo-field" bind:value={newTodo} placeholder="Enter a new todo" />
        <a on:click={addTodo}>
            <Hexagon className="hexagon-hover" minWidth="7rem">
                <span>
                    Submit
                </span>
            </Hexagon>
        </a>
    </Hexagon>

    <ul>
        {#each todos as todo, index}
            <li>
                <Hexagon>
                {todo}
                <a on:click={() => removeTodo(index)}>
                    <Hexagon className="hexagon-hover" minWidth="7rem">
                        <span>
                            Remove
                        </span>
                    </Hexagon>
                </a>
                </Hexagon>
            </li>
        {/each}
    </ul>
</div>

<style>
    .todo-wrapper {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    ul {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        text-wrap: wrap;
    }

    li {
        list-style-type: none;
        display: flex;
        flex-wrap: wrap;
        text-wrap: wrap;
        word-break: break-all;
    }

    .todo-field {
        width: 100%;
        border: none;
        outline: none;
        font-size: 1rem;
        padding: 0.5rem 1rem;
        background: var(--color-surfaceMixed-400);
        color: var(--color-foreground-400);
        border-radius: 0.5rem;
        box-shadow: 0rem 0rem 0.5rem var(--color-surfaceMixed-400);
    }
</style>
