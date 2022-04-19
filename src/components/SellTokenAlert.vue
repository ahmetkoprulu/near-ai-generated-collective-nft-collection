<template>
  <b-modal
    ref="sellAlert"
    ok-title="Sell"
    hide-header
    centered
    cancel-variant="default"
    :ok-disabled="loading"
    @ok="sell"
    @hidden="hidden"
  >
    <p>
      Are you sure you want to sell {{ token.token_id }} for
      {{ token.highest_bid }} NEAR.
    </p>
    <p>This action cannot be reverted.</p>
  </b-modal>
</template>
<script>
import BN from "bn.js";

export default {
  data() {
    return {
      loading: false,
      token: {},
    };
  },
  methods: {
    show(token) {
      this.token = token;
      this.$refs.sellAlert.show();
    },
    async sell(e) {
      e.preventDefault();

      this.loading = true;
      var success = await window.contract.nft_transfer(
        {
          receiver_id: "",
          token_id: this.token.token_id,
          approval_id: "",
          memo: "",
        },
        "300000000000000"
      );

      // if (success) {
      //   this.$bvToast.toast(
      //     `You selled asset ${this.token.token_id} for ${this.token.highest_bid} NEAR successfully.`,
      //     {
      //       title: `Sell Asset`,
      //       variant: "deafult",
      //       solid: true,
      //     }
      //   );
      // } else {
      //   this.$bvToast.toast("You could not sell your asset.", {
      //     title: `Sell Asset`,
      //     variant: "danger",
      //     solid: true,
      //   });
      // }
      this.$emit("sold");

      this.loading = false;
      this.$refs.sellAlert.hide();
    },
    hidden() {
      this.token = {};
    },
  },
};
</script>
