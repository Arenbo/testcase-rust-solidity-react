use async_std::sync::RwLock;
use serde::{Deserialize, Serialize};
use std::collections::hash_map::{Entry, HashMap};
use std::sync::Arc;
use tide::{Body, Request, Response, Server};

use tokio::time::{sleep, Duration};

use ethers::{
    core::{
        types::{Address, BlockNumber, Filter},
    },
    providers::{Middleware, Provider, StreamExt, Ws},
};
use ethers::utils::keccak256;
use ethers::types::H256;

use eyre::Result;

// ethereum network url
const WSS_URL: &str = "wss://sepolia.infura.io/ws/v3/PUT-YOUR-KEY-HERE";
// address of the contract we are watching
const CONTRACT_FABRIC_ADDRESS: &str = "PUT-CONTRACT-ADDRESS-HERE";
// list of event we looking for
const EVENT_2_CHECK_MINTED: &str = "TokenMinted(address,address,uint256,string)";
const EVENT_2_CHECK_CREATED: &str = "CollectionCreated(address,string,string)";

type Db = Arc<RwLock<HashMap<String, EventItem>>>;
fn init_db() -> Db {
    Arc::new(RwLock::new(HashMap::new()))
}

#[derive(Debug, Clone, Deserialize, Serialize)]
struct EventItem {
    name: String,
    block: String,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
struct EventList {
    eventlist: Vec<EventItem>,
}

#[tokio::main]
async fn main() -> Result<()> {
    // launching web server for serving events found
    let db = init_db();
    let db_clone = Arc::clone(&db);
    tokio::spawn(async move {
        let _tide_res = tide_main(db).await;
    });

    // subscribing to events on ethereum network
    let client = Provider::<Ws>::connect(WSS_URL).await?;
    let client = Arc::new(client);
    let address: Address = CONTRACT_FABRIC_ADDRESS.parse()?;

    let last_block = client.get_block(BlockNumber::Latest).await?.unwrap().number.unwrap();
    println!("last_block: {last_block}");

    let contract_filter = Filter::new()
    .address(address)
    .events(vec![
        EVENT_2_CHECK_MINTED,
        EVENT_2_CHECK_CREATED
    ])
    .from_block(last_block-10);
    let mut stream = client.subscribe_logs(&contract_filter).await?;
    while let Some(log) = stream.next().await {
        let event_name_hash = log.topics.get(0).unwrap().to_string();
        let event_2_check_minted_hash = H256::from(keccak256(EVENT_2_CHECK_MINTED)).to_string();
        let event_2_check_created_hash = H256::from(keccak256(EVENT_2_CHECK_CREATED)).to_string();

        let mut event_name = String::new();

        // checking what kind of event found
        if event_name_hash.eq(&event_2_check_minted_hash) {
            println!("TokenMinted found");
            event_name.push_str("TokenMinted");
        }
        if event_name_hash.eq(&event_2_check_created_hash) {
            println!("CollectionCreated found");
            event_name.push_str("CollectionCreated");
        }

        let mut eventlist = db_clone.write().await;
        let new_eventitem = EventItem{name: event_name, block: log.block_number.unwrap().to_string()};
        eventlist.insert(String::from(log.transaction_hash.unwrap().to_string()), new_eventitem.clone());
    
        println!(
            "block_number: {:?}, transaction_hash: {:?}, log_a: {:?}, log_t0: {:?}",
            log.block_number.unwrap().to_string(),
            log.transaction_hash.unwrap().to_string(),
            log.address,
            log.topics.get(0).unwrap(),
        );
    }
    
    Ok(())
}

async fn tide_main(db: Db) -> Result<(), std::io::Error> {
    let mut app = tide::with_state(db);
    app.at("/").get(|_| async { Ok("ok") });
    app.at("/list").get(handler_list);

    app.listen("127.0.0.1:8080").await.unwrap();
    Ok(())
}

async fn handler_list(req: tide::Request<Db>) -> tide::Result {
    let eventlist = req.state().read().await;
    // get all the eventlist as a vector
    let eventlist_vec: Vec<EventItem> = eventlist.values().cloned().collect();
    let mut res = Response::new(200);
    res.set_body(Body::from_json(&eventlist_vec)?);
    Ok(res)
}