# Football API

## Steps to run the application

- Download and install Git from [here](https://git-scm.com/download).
- Download and install Node from [here](https://nodejs.org/en). Install version 18.17.0 or above.
- Install the package manager. Run the following command on your terminal/powershell:

  ```bash
  npm i -g yarn@1.22.19
  ```

- Clone the Git repository. Run any of the following command on your terminal/powershell **[Not required if you are using the zip]**:
  - **SSH:** `git clone git@github.com:Asad13/sports-api.git`
  - **HTTPS:** `git clone https://github.com/Asad13/sports-api.git`
- Convert the name of the file .env.example to .env (Not needed for zip version).
- Download and install Redis. Use on of the following approach:

  - **Local:** Follow the instructions [here](https://redis.io/docs/getting-started/installation/) on Redis's website according to your Operating System to install Redis on your local machine.
  - **Remote:** Add the **URL** of the remote Redis database as an environmet variable in the .env file with name **REDIS_URL**.
    - **Format of the URL:** redis[s]://[[username][:password]@][host][:port][/db-number]
    - **Example:** "redis://alice:foobared@awesome.redis.server:6380"
  - **Docker:**

    - Install Docker from [here](https://docs.docker.com/engine/install/)
    - Start Redis:

    ```bash
    yarn run redis:start
    ```

    - If you want to stop Redis later use the following command:

    ```bash
    yarn run redis:remove
    ```

    - If you want to restart Redis for any reason later use the following command:

    ```bash
    yarn run redis:restart
    ```

- Open terminal/powershell at the same location as of your application's directory to run rest of the commands.
- Install all the dependencies. Run the following command on your terminal/powershell:

  ```bash
  yarn install
  ```

- Start the application:

  ```bash
  yarn run dev
  ```

- visit **<http://localhost:3000>** to see your application running.
- To convert **Typescrpt** files to **JavaScript** files in the **dist** folder, run the following command:

  ```bash
  yarn run build
  ```

- To run the application using **Javascript** files instead of **Typescript**, run the following command:

  ```bash
  yarn start
  ```

- To find **API Documentation** visit **<http://localhost:3000/docs>** from any browser.
- To get **API Documentation** in **JSON** visit **<http://localhost:3000/docs.json>**. You can use
  this data in postman to test API.
- You can see the logs of the application in the **logs** folder in the application directory.
