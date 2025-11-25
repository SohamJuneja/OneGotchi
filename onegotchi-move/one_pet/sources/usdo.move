module one_pet::usdo {
    use std::option;
    use one::coin;
    use one::transfer;
    use one::tx_context::TxContext;

    // The One-Time-Witness (OTW) for the Coin
    public struct USDO has drop {}

    fun init(witness: USDO, ctx: &mut TxContext) {
        let (treasury, metadata) = coin::create_currency(
            witness, 
            9, 
            b"USDO", 
            b"One USD", 
            b"OneChain Stablecoin", 
            option::none(), 
            ctx
        );
        
        // Make the metadata public (frozen)
        transfer::public_freeze_object(metadata);
        
        // Share the TreasuryCap so ANYONE can mint (Faucet Mode for Hackathon)
        // In real life, you would keep this private.
        transfer::public_share_object(treasury);
    }

    // A public faucet function for your Frontend
    public fun faucet(
        treasury_cap: &mut coin::TreasuryCap<USDO>, 
        amount: u64, 
        ctx: &mut TxContext
    ) {
        coin::mint_and_transfer(treasury_cap, amount, ctx.sender(), ctx);
    }
}
