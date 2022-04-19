<template>
  <div class="w-100 mt-5" v-if="!isTotalExceed">
    <b-overlay
      variant="white"
      :opacity="0.75"
      spinner-variant="secondary"
      :show="loading"
      rounded="sm"
    >
      <img class="mx-auto d-block" :src="imgUrl" width="512" height="512" />
      <div class="mt-3 mb-4 d-flex justify-content-center">
        <b-button variant="default" @click="generateNewImage">
          <b-icon icon="arrow-clockwise"> </b-icon>
        </b-button>
        <b-button variant="outline-primary" @click="mint">
          Mint <b-icon icon="arrow-right"> </b-icon>
        </b-button>
      </div>
    </b-overlay>
  </div>
</template>
<script>
import axios from "axios";
import { utils } from "near-api-js";
import BN from "bn.js";

export default {
  data() {
    return {
      loading: true,
      imgId: null,
      imgUrl: null,
    };
  },
  async mounted() {
    await this.generateNewImage();
  },
  methods: {
    async generateNewImage() {
      this.loading = true;
      try {
        axios.interceptors.request.use(function (config) {
          config.headers["api-key"] = "b805dfe8-5dd2-48ff-b0be-c21b7717a18d";
          return config;
        });
        const config = {
          headers: {
            "Content-Type": "application/json",
          },
        };
        const data = new FormData();
        data.append("text", "comic");
        const response = await axios.get(
          "https://api.deepai.org/api/text2img",
          data,
          config
        );
        this.imgId = response.data.id;
        this.imgUrl = response.data.output_url;
      } catch (err) {
        console.error(err);
      }
      this.loading = false;
    },
    async mint() {
      await window.contract.nft_mint(
        {
          token_id: this.imgId,
          receiver_id: window.accountId,
          token_metadata: {
            title: this.imgId,
            description: "AI generated image.",
            media: this.imgUrl,
            media_hash: "",
            copies: 1,
            issued_at: 0,
            expires_at: 0,
            starts_at: 0,
            updated_at: 0,
            extra: "",
            reference: "",
            reference_hash: "",
          },
        },
        "300000000000000",
        new BN(utils.format.parseNearAmount("1"))
      );
    },
  },
  props: {
    isTotalExceed: {
      type: Boolean,
      required: true,
    },
    isSignedIn: {
      type: Boolean,
    },
  },
};
</script>
