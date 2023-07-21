import amqp from 'amqplib';
import io from 'socket.io-client';

const socket = io('http://localhost:4000');
const rabbitSettings = {
  protocol: 'amqp',
  hostname: '34.199.194.98',//'34.232.106.165'darinel,
  port: 5672,
  username: 'angel',
  password: 'angel',
};

(async () => {
  const queue1 = "Alerts";
  const queue2 = "Notifications";
  const queue3 = "Updates";
  try {
    const conn1 = await amqp.connect(rabbitSettings);
    console.log('Conexión exitosa');

    const channel1 = await conn1.createChannel();
    console.log('Canal creado exitosamente');

    channel1.consume(queue1, async (msg) => {
        const options = {
            method: "POST",
            body: JSON.stringify({
              affectedUserId: msg.content.toJSON().affectedUserId,
              type: msg.content.toJSON().type,
              description: msg.content.toJSON().description,
              severity: msg.content.toJSON().severity,
              
            }),
            headers: {
              "Content-Type": "application/json"
            }
          };
          await fetch("http://54.161.75.228:3002/alerts", options)
          .then(response => response.json())
          .then(data => {
            console.log(data);
            channel1.ack(msg);
          })
      console.log(msg.content.toString());
    });

    const conn2 = await amqp.connect(rabbitSettings);
    console.log('Conexión exitosa');

    const channel2 = await conn2.createChannel();
    console.log('Canal creado exitosamente');

    channel2.consume(queue2, async (msg) => {
        socket.emit('alert', msg.content.toJSON());
        channel2.ack(msg);
        console.log(msg.content.toString());
    });

    const conn3 = await amqp.connect(rabbitSettings);
    console.log('Conexión exitosa');

    const channel3 = await conn3.createChannel();
    console.log('Canal creado exitosamente');

    channel3.consume(queue3, async (msg) => {
        const options = {
            method: "PUT",
            body: JSON.stringify({
              status: Number(msg.content.toString()),
            }),
            headers: {
              "Content-Type": "application/json"
            }
          };
          await fetch("http://54.161.75.228:3002/alerts", options)
          .then(response => response.json())
          .then(data => {
            console.log(data);
            channel3.ack(msg);
          })
      console.log(msg.content.toString());
    });


  } catch (error) {
    console.log("🚀 ~ file: consumer.js:28 ~ connect ~ error:", error)
    throw error;
  }
})();

// import { connect } from 'amqplib';

// const rabbitSettings = {