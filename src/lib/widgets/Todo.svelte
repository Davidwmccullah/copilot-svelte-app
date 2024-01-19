<script lang="ts">
  import Hexagon from "../shapes/Hexagon.svelte";

    let todos: string[] = [];
    let newTodo: string = '';

    let addTodo = (): void => {
        if (newTodo.trim() !== '') {
            todos = [...todos, newTodo];
            newTodo = '';
        }
    }

    let removeTodo = (index: number): void => {
        todos = todos.filter((_, i) => i !== index);
    }
</script>

<div class="todo-wrapper">
    <Hexagon>
        <input type="text" class="todo-field" bind:value={newTodo} placeholder="Enter a new todo" />
        <button aria-label="Add Todo" on:click={addTodo}>
            <Hexagon class="hexagon-hover" minWidth="7rem">
                <strong>
                    <i class="fas fa-pen"></i>
                </strong>
            </Hexagon>
        </button>
    </Hexagon>

    <Hexagon style="min-width: 100%;">
    </Hexagon>

    <ul>
        {#each todos as todo, index}
            <li>
                <Hexagon class="expand">
                {todo}
                <button aria-label="Remove Todo" on:click={() => removeTodo(index)}>
                    <Hexagon class="hexagon-hover warn" style="">
                        <strong>
                            <i class="fas fa-trash"></i>
                        </strong>
                    </Hexagon>
                </button>
                </Hexagon>
            </li>
        {/each}
    </ul>
</div>

<style>
    .todo-wrapper {
        max-height: 100%;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        align-items: center;
    }

    ul {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        text-wrap: wrap;
        overflow-y: scroll;
        padding: 1rem;
        width: 100%;
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
        background: var(--color-surfaceMixed-400);
        color: var(--color-foreground-400);
        border-radius: 0.5rem;
        box-shadow: 0rem 0rem 0.5rem var(--color-surfaceMixed-400);
        min-width: fit-content;
    }

    :global(.expand) {
        flex: 1 1 0;
    }

    :global(.expand .hexagon) {
        display: flex;
        /* always fill available space */
        flex: 1;
        justify-content: space-between !important;
    }
</style>
