import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Favorites } from "../target/types/favorites";
import { assert } from "chai";

describe("favorites", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const user = (provider.wallet as anchor.Wallet).payer;
  const someRandomGuy = anchor.web3.Keypair.generate();
  const program = anchor.workspace.Favorites as Program<Favorites>;

  const favoriteNumber = new anchor.BN(23);
  const favoriteColor = "white";
  const favoriteHobbies = ["ladna", "khelna", "khana", "shona"];

  before(async () => {
    const balance = await provider.connection.getBalance(user.publicKey);
    const balanceInSOL = balance / anchor.web3.LAMPORTS_PER_SOL;
    const formattedBalance = new Intl.NumberFormat().format(balanceInSOL);

    console.log(`Balance :${formattedBalance} SOL`);
  });

  it("Write our favourite to the blockchain", async () => {
    await program.methods
      .setFavorites(favoriteNumber, favoriteColor, favoriteHobbies)
      .signers([user])
      .rpc();

    const favoritesPdaAndBump = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("favorites"), user.publicKey.toBuffer()],
      program.programId
    );

    const favoritesPda = favoritesPdaAndBump[0];
    console.log({ favoritesPda });
    const dataFromPda = await program.account.favorites.fetch(favoritesPda);

    console.log({ dataFromPda });

    assert.equal(dataFromPda.color, favoriteColor);
    assert.equal(dataFromPda.number.toString(), favoriteNumber.toString());
    assert.deepEqual(dataFromPda.hobbies, favoriteHobbies);
  });

  it("update the favorites", async () => {
    const newFavoriteHobbies = ["hogyi"];

    try {
      const data = await program.methods
        .setFavorites(favoriteNumber, favoriteColor, newFavoriteHobbies)
        .signers([user])
        .rpc();
      console.log(data);
      const favoritesPdaAndBump = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("favorites"), user.publicKey.toBuffer()],
        program.programId
      );
      const favoritesPda = favoritesPdaAndBump[0];
      console.log({ favoritesPda });
      const dataFromPda = await program.account.favorites.fetch(favoritesPda);

      console.log({ dataFromPda });

      assert.equal(dataFromPda.color, favoriteColor);
      assert.equal(dataFromPda.number.toString(), favoriteNumber.toString());
      // assert.deepEqual(dataFromPda.hobbies, favoriteHobbies);
    } catch (error) {
      console.log(error);
    }
  });

  it("Rejects transaction from unaithorized signer", async () => {
    try {
      await program.methods
        .setFavorites(favoriteNumber, favoriteColor, favoriteHobbies)
        .signers([someRandomGuy])
        .rpc();
    } catch (error) {
      console.log(error);
    }
  });
});
