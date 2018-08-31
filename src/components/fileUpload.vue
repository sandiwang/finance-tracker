<template>
  <div class="drag-drop-fileUpload">
    <form enctype="multipart/form-data" novalidate v-if="isInitial || isSaving">
      <!-- <div class="heading">{{ title }}</div> -->
      <div class="drag-drop-container" :class="{ 'dragging': draggingOver }">
        <input type="file" :disabled="isSaving" v-on:dragleave="isDraggingLeaving" v-on:dragover="isDraggingOver" @change="filesChange('imgs', $event.target.files)" accept="image/*" class="drag-drop-input-file">
        <div v-if="isInitial" class="heading">{{ title }}</div>
        <div v-if="isSaving" class="heading uploading">Uploading Image</div>
      </div>
      <v-alert class="fileUpload-error-msg" type="error" :value="uploadError">
        {{ uploadError }}
      </v-alert>
    </form>
  </div>
</template>

<script>
import firebase from 'firebase'

const STATUS_INITIAL = 0, STATUS_SAVING = 1, STATUS_SUCCESS = 2, STATUS_FAILED = 3

export default {
  name: 'fileUpload',
  props: {
    url: {
      type: String
    },
    reset: {
      type: Boolean
    },
    title: {
      default: 'Drag or upload file here',
      type: String
    }
  },
  data () {
    return {
      currentStatus: null,
      uploadedFiles: [],
      uploadError: null,
      draggingOver: false,
      fileUrl: null
    } 
  },
  mounted () {
    this.doReset()
  },
  watch: {
    reset (value) {
      if (value === true) this.doReset()
    }
  },
  computed: {
    isInitial() {
      return this.currentStatus === STATUS_INITIAL;
    },
    isSaving() {
      return this.currentStatus === STATUS_SAVING;
    },
    isSuccess() {
      return this.currentStatus === STATUS_SUCCESS;
    },
    isFailed() {
      return this.currentStatus === STATUS_FAILED;
    }
  },
  methods: {
    doReset () {
      this.currentStatus = STATUS_INITIAL;
      this.uploadedFiles = [];
      this.uploadError = null;
    },
    save(file) {
      this.currentStatus = STATUS_SAVING;

      firebase.storage().ref(`${this.url}/${file.name}`).put(file)
        .then(snapshot => {
          this.fileUrl = snapshot.downloadURL
          this.currentStatus = STATUS_SUCCESS
          this.$emit('uploadSuccess', this.fileUrl)
        })
        .catch(err => {
          this.uploadError = err
          this.currentStatus = STATUS_FAILED
        })
    },
    filesChange(fieldName, fileList) {
      if (!fileList.length) return;

      this.save(fileList[0]);
    },
    isDraggingOver () {
      this.draggingOver = true
    },
    isDraggingLeaving () {
      this.draggingOver = false
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .drag-drop-fileUpload .drag-drop-container {
    min-height: 200px;
    border: 2px dashed grey;
    position: relative;
  }

  .drag-drop-fileUpload .drag-drop-container.dragging {
    border-style: solid;
  }
  
  .drag-drop-input-file {
    width: 100%;
    height: 200px;
    position: absolute;
    cursor: pointer;
    opacity: 0;
  }

  .drag-drop-container .heading {
    line-height: 200px;
    text-align: center;
  }
</style>
