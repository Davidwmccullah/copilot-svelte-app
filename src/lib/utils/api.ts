export let getapi = async (url: string): Promise<any> => {
    let response = await fetch(url);
    let data = await response.json();
    console.log(data);
}
